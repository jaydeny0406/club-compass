import type { ReactNode } from "react";
import { requireSchool } from "@/lib/auth/session";
export default async function StaffLayout({children,params}:{children:ReactNode;params:Promise<{schoolSlug:string}>}) {await requireSchool((await params).schoolSlug,["STAFF","ADMIN"]);return children;}
