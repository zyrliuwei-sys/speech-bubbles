import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { CheckCircle2, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import { useSession } from '@/core/auth/client';
import { Link } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';
import { CATEGORIES } from '@/config/sites';
import { apiPost } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import { categoryLabel } from '@/blocks/nav-i18n';
import { TextField } from '@/components/form-field';
import { Button, buttonVariants } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';

const TAGLINE_MAX = 120;

/** Server error codes (src/modules/submissions/service.ts) → translated text. */
const SUBMIT_ERRORS: Record<string, () => string> = {
  invalid_name: () => m['landing.submit.error_name'](),
  invalid_url: () => m['landing.submit.error_url'](),
  invalid_category: () => m['landing.submit.error_category'](),
  invalid_tagline: () => m['landing.submit.error_tagline'](),
  duplicate: () => m['landing.submit.error_duplicate'](),
  daily_limit: () => m['landing.submit.error_limit'](),
};

export const Route = createFileRoute('/submit')({
  loader: () => {
    const locale = getLocale();
    return {
      title: m['landing.submit.title']({}, { locale }),
      description: m['landing.submit.subtitle']({}, { locale }),
    };
  },
  head: ({ loaderData }) =>
    loaderData
      ? {
          meta: [
            { title: `${loaderData.title} | ${envConfigs.app_name}` },
            { name: 'description', content: loaderData.description },
          ],
        }
      : {},
  component: SubmitPage,
});

function SubmitPage() {
  const { data: session, isPending } = useSession();
  const [published, setPublished] = useState<string | null>(null);

  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-[640px] flex-1 px-4 py-10 sm:py-14">
        <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          {m['landing.submit.title']()}
        </h1>
        <p className="text-muted-foreground mt-3 text-lg">
          {m['landing.submit.subtitle']()}
        </p>

        <div className="mt-8">
          {isPending ? (
            <div className="bg-muted h-72 animate-pulse rounded-2xl" />
          ) : !session?.user ? (
            <SignInPrompt />
          ) : published ? (
            <Published slug={published} onAgain={() => setPublished(null)} />
          ) : (
            <SubmitForm onPublished={setPublished} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function SignInPrompt() {
  return (
    <div className="bg-card rounded-2xl border p-6 sm:p-8">
      <p className="font-semibold">{m['landing.submit.sign_in_title']()}</p>
      <p className="text-muted-foreground mt-1 text-sm">
        {m['landing.submit.sign_in_desc']()}
      </p>
      <Link
        href="/sign-in?callbackUrl=/submit"
        className={cn(buttonVariants(), 'mt-5 gap-1.5')}
      >
        <LogIn className="size-4" />
        {m['common.nav.sign_in']()}
      </Link>
    </div>
  );
}

function Published({ slug, onAgain }: { slug: string; onAgain: () => void }) {
  return (
    <div className="bg-card rounded-2xl border p-6 sm:p-8">
      <CheckCircle2 className="size-8 text-emerald-500" />
      <p className="mt-3 text-lg font-semibold">
        {m['landing.submit.success_title']()}
      </p>
      <p className="text-muted-foreground mt-1 text-sm">
        {m['landing.submit.success_desc']()}
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link href={`/site/${slug}`} className={buttonVariants()}>
          {m['landing.submit.view_listing']()}
        </Link>
        <Button variant="outline" onClick={onAgain}>
          {m['landing.submit.submit_another']()}
        </Button>
      </div>
    </div>
  );
}

function SubmitForm({ onPublished }: { onPublished: (slug: string) => void }) {
  const schema = z.object({
    name: z
      .string()
      .trim()
      .min(2, m['landing.submit.error_name']())
      .max(60, m['landing.submit.error_name']()),
    url: z
      .string()
      .trim()
      .regex(/^https?:\/\/[^\s/]+\.[^\s]+$/i, m['landing.submit.error_url']()),
    category: z
      .string()
      .refine(
        (v) => CATEGORIES.some((c) => c.slug === v),
        m['landing.submit.error_category']()
      ),
    tagline: z
      .string()
      .trim()
      .min(10, m['landing.submit.error_tagline']())
      .max(TAGLINE_MAX, m['landing.submit.error_tagline']()),
  });

  const mutation = useMutation({
    mutationFn: (vars: z.infer<typeof schema>) =>
      apiPost<{ slug: string }>('/api/submissions', vars),
    onSuccess: ({ slug }) => {
      toast.success(m['landing.submit.success_title']());
      onPublished(slug);
    },
    onError: (e: Error) =>
      toast.error(SUBMIT_ERRORS[e.message]?.() ?? e.message),
  });

  const form = useForm({
    defaultValues: {
      name: '',
      url: '',
      category: '',
      tagline: '',
    },
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(schema.parse(value)).catch(() => {});
    },
  });

  return (
    <form
      className="bg-card space-y-5 rounded-2xl border p-6 sm:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.Field name="name">
        {(field) => (
          <TextField
            field={field}
            label={m['landing.submit.name']()}
            placeholder={m['landing.submit.name_placeholder']()}
            required
          />
        )}
      </form.Field>

      <form.Field name="url">
        {(field) => (
          <TextField
            field={field}
            label={m['landing.submit.url']()}
            type="url"
            placeholder="https://"
            required
          />
        )}
      </form.Field>

      <form.Field name="category">
        {(field) => {
          const error =
            field.state.meta.isTouched && field.state.meta.errors.length > 0;
          return (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {m['landing.submit.category']()}
              </FieldLabel>
              <select
                id={field.name}
                name={field.name}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                required
                aria-invalid={error || undefined}
                className="border-input bg-background focus-visible:ring-ring/50 aria-invalid:border-destructive h-9 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-[3px]"
              >
                <option value="" disabled>
                  {m['landing.submit.category_placeholder']()}
                </option>
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.emoji} {categoryLabel(c.slug)}
                  </option>
                ))}
              </select>
              {error && (
                <p className="text-destructive text-sm">
                  {m['landing.submit.error_category']()}
                </p>
              )}
            </Field>
          );
        }}
      </form.Field>

      <form.Field name="tagline">
        {(field) => {
          const error =
            field.state.meta.isTouched && field.state.meta.errors.length > 0;
          return (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {m['landing.submit.tagline']()}
              </FieldLabel>
              <Textarea
                id={field.name}
                name={field.name}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                maxLength={TAGLINE_MAX}
                rows={3}
                placeholder={m['landing.submit.tagline_placeholder']()}
                required
                aria-invalid={error || undefined}
              />
              <div className="flex justify-between gap-3 text-sm">
                <span className="text-destructive">
                  {error ? m['landing.submit.error_tagline']() : ''}
                </span>
                <span className="text-muted-foreground tabular-nums">
                  {field.state.value.length}/{TAGLINE_MAX}
                </span>
              </div>
            </Field>
          );
        }}
      </form.Field>

      <p className="text-muted-foreground text-xs">
        {m['landing.submit.note']()}
      </p>

      <form.Subscribe selector={(s) => s.isSubmitting}>
        {(isSubmitting) => (
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? m['landing.submit.submitting']()
              : m['landing.submit.submit']()}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
