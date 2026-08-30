import type {
  ReactNode,
} from "react";

import {
  requireSelector,
} from "@/lib/selectors/auth";

export default async function SelectorPortalLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireSelector();

  return children;
}
