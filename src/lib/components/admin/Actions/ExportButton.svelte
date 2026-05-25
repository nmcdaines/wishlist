<script lang="ts">
    import { toaster } from "$lib/components/toaster";
    import { getFormatter } from "$lib/i18n";
    import { resolve } from "$app/paths";

    const t = getFormatter();

    let loading = $state(false);

    const onClick = async () => {
        loading = true;
        try {
            const resp = await fetch(resolve("/api/admin/export"));
            if (!resp.ok) {
                toaster.error({ description: $t("general.oops") });
                return;
            }
            const blob = await resp.blob();
            const disposition = resp.headers.get("Content-Disposition") ?? "";
            const match = disposition.match(/filename="([^"]+)"/);
            const filename = match ? match[1] : "wishlist-export.json";
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            toaster.error({ description: $t("general.oops") });
        } finally {
            loading = false;
        }
    };
</script>

<button class="preset-filled-primary-500 btn w-fit" disabled={loading} onclick={onClick} type="button">
    {$t("admin.export-data")}
</button>
