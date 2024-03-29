import { FilterSchema } from "@/lib/validation";
import TodoItem from "./TodoItem";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import Link from "next/link";
import { auth } from "@/auth";

export default async function TodoList({ q, status, hasName }: FilterSchema) {
  const userRole = (await auth())?.user?.role;

  const searchString = q
    ?.split(" ")
    .filter((word) => word.length > 0)
    .join(" & ");

  const searchFilter: Prisma.TodoWhereInput = searchString
    ? {
        OR: [
          { text: { search: searchString } },
          { lastName: { search: searchString } },
          { firstName: { search: searchString } },
        ],
      }
    : {};

  const hasNameFilter: Prisma.TodoWhereInput = hasName
    ? { OR: [{ firstName: { not: null } }, { lastName: { not: null } }] }
    : {};

  const where: Prisma.TodoWhereInput = {
    AND: [searchFilter, hasNameFilter, status ? { status } : {}],
  };

  if (userRole != "ADMIN") {
    where.NOT = { status: "InReview" };
  }

  const todos = await prisma.todo.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex-grow space-y-4">
      {todos.map((todo) => (
        <Link key={todo.id} href={`/todo/${todo.id}`} className="block">
          <TodoItem {...todo} />
        </Link>
      ))}
      {todos.length == 0 && (
        <p className="m-auto text-center">Nothing found. Try adjusting your search filters.</p>
      )}
    </div>
  );
}
