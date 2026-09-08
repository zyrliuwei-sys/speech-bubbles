import { and, desc, eq, isNull, ne } from 'drizzle-orm';

import { db } from '@/core/db';
import { aiTask } from '@/config/db/schema';
import { consume, revoke } from '@/modules/credits/service';
import { getUuid } from '@/lib/hash';

export enum AITaskStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELED = 'canceled',
}

/**
 * Create an AI task with optional credit consumption.
 */
export async function createTask(params: {
  userId: string;
  mediaType: string;
  provider: string;
  model: string;
  prompt: string;
  costCredits?: number;
  options?: any;
}): Promise<any> {
  const { userId, mediaType, provider, model, prompt, costCredits, options } =
    params;

  return db().transaction(async (tx: any) => {
    // 1. Insert task
    const taskData: any = {
      id: getUuid(),
      userId,
      mediaType,
      provider,
      model,
      prompt,
      status: AITaskStatus.PENDING,
      costCredits: costCredits || 0,
    };

    const [task] = await tx.insert(aiTask).values(taskData).returning();

    // 2. Consume credits if cost > 0
    if (costCredits && costCredits > 0) {
      const result = await consume({
        userId,
        credits: costCredits,
        scene: 'ai_task',
        description: `AI ${mediaType} generation`,
        metadata: JSON.stringify({ taskId: task.id }),
        tx,
      });

      if (!result.success) {
        throw new Error('Insufficient credits');
      }

      // Store consumed credit ID for potential revocation
      if (result.consumedCredit) {
        await tx
          .update(aiTask)
          .set({
            taskInfo: JSON.stringify({ creditId: result.consumedCredit.id }),
          })
          .where(eq(aiTask.id, task.id));
      }
    }

    return task;
  });
}

/**
 * Update task status. Revokes credits on failure.
 */
export async function updateTask(params: {
  taskId: string;
  status: AITaskStatus;
  taskResult?: any;
}) {
  const { taskId, status, taskResult } = params;

  return db().transaction(async (tx: any) => {
    const [task] = await tx
      .select()
      .from(aiTask)
      .where(eq(aiTask.id, taskId))
      .limit(1)
      .for('update');
    if (!task) throw new Error('Task not found');
    if (
      [
        AITaskStatus.SUCCESS,
        AITaskStatus.FAILED,
        AITaskStatus.CANCELED,
      ].includes(task.status)
    )
      return;
    if (
      (status === AITaskStatus.FAILED || status === AITaskStatus.CANCELED) &&
      task.taskInfo
    ) {
      const info = JSON.parse(task.taskInfo);
      if (info.creditId) await revoke(info.creditId, tx);
    }
    await tx
      .update(aiTask)
      .set({
        status,
        ...(taskResult ? { taskResult: JSON.stringify(taskResult) } : {}),
      })
      .where(eq(aiTask.id, taskId));
  });
}

/**
 * Get tasks for a user.
 */
export async function getTasks(params: {
  userId: string;
  mediaType?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const { userId, mediaType, status, page = 1, limit = 20 } = params;

  return db()
    .select()
    .from(aiTask)
    .where(
      and(
        eq(aiTask.userId, userId),
        mediaType ? eq(aiTask.mediaType, mediaType) : undefined,
        status ? eq(aiTask.status, status) : undefined,
        isNull(aiTask.deletedAt)
      )
    )
    .orderBy(desc(aiTask.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);
}

/**
 * Find task by ID.
 */
export async function findTask(taskId: string) {
  const [result] = await db()
    .select()
    .from(aiTask)
    .where(eq(aiTask.id, taskId))
    .limit(1);
  return result;
}

/** Persist the upstream ID separately from the internal, user-owned task ID. */
export async function setProviderTaskId(
  taskId: string,
  providerTaskId: string
) {
  await db()
    .update(aiTask)
    .set({ taskId: providerTaskId })
    .where(eq(aiTask.id, taskId));
}

/** Keep the actual image bytes in the account record, not an expiring provider URL. */
export async function saveTaskImage(
  taskId: string,
  userId: string,
  imageDataUrl: string
) {
  return db().transaction(async (tx: any) => {
    const [task] = await tx
      .select()
      .from(aiTask)
      .where(and(eq(aiTask.id, taskId), eq(aiTask.userId, userId)))
      .limit(1)
      .for('update');
    if (!task) throw new Error('Task not found');
    if ([AITaskStatus.FAILED, AITaskStatus.CANCELED].includes(task.status))
      throw new Error('Task has failed');
    if (task.taskResult && JSON.parse(task.taskResult).imageDataUrl) return;
    await tx
      .update(aiTask)
      .set({
        status: AITaskStatus.SUCCESS,
        taskResult: JSON.stringify({ imageDataUrl }),
      })
      .where(eq(aiTask.id, taskId));
  });
}

/** Paginated metadata only; image bytes are fetched separately for visible cards. */
export async function getImageHistory(
  userId: string,
  model: string,
  page: number,
  limit = 12
) {
  const rows = await db()
    .select({
      id: aiTask.id,
      prompt: aiTask.prompt,
      status: aiTask.status,
      createdAt: aiTask.createdAt,
    })
    .from(aiTask)
    .where(
      and(
        eq(aiTask.userId, userId),
        eq(aiTask.model, model),
        eq(aiTask.mediaType, 'image'),
        isNull(aiTask.deletedAt),
        ne(aiTask.status, AITaskStatus.FAILED),
        ne(aiTask.status, AITaskStatus.CANCELED)
      )
    )
    .orderBy(desc(aiTask.createdAt), desc(aiTask.id))
    .limit(limit + 1)
    .offset((page - 1) * limit);
  return { items: rows.slice(0, limit), hasMore: rows.length > limit };
}
