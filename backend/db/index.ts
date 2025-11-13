import { SQLDatabase } from "encore.dev/storage/sqldb";

export default new SQLDatabase("noghre_sod_db", {
  migrations: "./migrations",
});
