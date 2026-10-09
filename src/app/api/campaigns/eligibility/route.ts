import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  await requireSession();
  const province = req.nextUrl.searchParams.get("province") || "";
  const canton = req.nextUrl.searchParams.get("canton") || "";
  const rows = await db()`
    select i.id,i.name,i.email,i.province,i.canton
    from institutions i left join suppression_list s on lower(s.email)=lower(i.email)
    where i.deleted_at is null and i.type='Escuela'
      and i.contact_permission='Autorizado' and i.status<>'No contactar'
      and i.email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
      and s.id is null
      and (${province}='' or i.province=${province})
      and (${canton}='' or i.canton=${canton})
    order by i.name`;
  return NextResponse.json(rows);
}
