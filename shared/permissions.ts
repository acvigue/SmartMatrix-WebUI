import type { Database } from "@/supabase";
import { serverSupabaseClient } from '#supabase/server'

export enum PermissionLevel {
    CONTRACTOR = "contractor",
    ADMIN = "admin",
    SUPERADMIN = "superadmin",
}

export const permissionGuardServer = async (event: any, required_level: PermissionLevel): Promise<boolean> => {
    const supabase = await serverSupabaseClient<Database>(event);
    const { data, error } = await supabase.rpc("get_my_claim", { claim: "user_role" })

    if (error) {
        return false
    }

    if (required_level === PermissionLevel.CONTRACTOR) {
        return true
    }
    if (required_level === PermissionLevel.ADMIN && (data === PermissionLevel.ADMIN || data === PermissionLevel.SUPERADMIN)) {
        return true
    }
    if (required_level === PermissionLevel.SUPERADMIN && (data === PermissionLevel.SUPERADMIN)) {
        return true
    }
    return false
}