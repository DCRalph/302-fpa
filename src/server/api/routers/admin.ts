import { createTRPCRouter } from "~/server/api/trpc";
import { editHomeRouter } from "./admin/edithome";

export const adminRouter = createTRPCRouter({
  editHome: editHomeRouter,
});