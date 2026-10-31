export interface DbConfig {
  database_provider: string;
  database_url: string;
  database_auth_token?: string;
  db_schema?: string;
  db_singleton_enabled?: string;
  db_max_connections?: string;
  d1_account_id?: string;
  d1_database_id?: string;
  d1_api_token?: string;
}
