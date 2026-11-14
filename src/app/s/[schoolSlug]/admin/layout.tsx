import type { ReactNode } from "react";
import { requireSchool } from "@/lib/auth/session";
export default async function AdminLayout({children,params}:{children:ReactNode;params:Promise<{schoolSlug:string}>}) {await requireSchool((await params).schoolSlug,["ADMIN"]);return children;}
