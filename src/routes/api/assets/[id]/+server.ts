import { getFormatter } from "$lib/server/i18n";
import { error, type RequestHandler } from "@sveltejs/kit";
import { readFileSync } from "fs";
import { env } from "$env/dynamic/private";

export const GET: RequestHandler = async ({ params }) => {
    const $t = await getFormatter();

    if (!params.id) {
        error(400, $t("errors.must-specify-asset-id"));
    }

    try {
        const uploadPath = env.UPLOAD_PATH || "uploads";
        const asset = readFileSync(`${uploadPath}/${params.id}`);
        return new Response(asset, {
            headers: {
                "Cache-Control": "public, max-age=31536000"
            }
        });
    } catch {
        error(404, $t("errors.asset-not-found"));
    }
};
