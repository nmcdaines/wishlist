import { Role } from "$lib/schema";
import { client } from "$lib/server/prisma";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { requireRole } from "$lib/server/auth";

export const GET: RequestHandler = async () => {
    await requireRole(Role.ADMIN);

    const [users, groups, lists] = await Promise.all([
        client.user.findMany({
            select: {
                id: true,
                username: true,
                name: true,
                email: true,
                role: { select: { id: true } },
                UserGroupMembership: {
                    select: {
                        group: { select: { id: true, name: true } },
                        role: { select: { id: true } }
                    }
                }
            },
            orderBy: { username: "asc" }
        }),
        client.group.findMany({
            select: { id: true, name: true },
            orderBy: { name: "asc" }
        }),
        client.list.findMany({
            select: {
                id: true,
                name: true,
                description: true,
                public: true,
                owner: { select: { id: true, username: true, name: true } },
                group: { select: { id: true, name: true } },
                items: {
                    select: {
                        displayOrder: true,
                        approved: true,
                        item: {
                            select: {
                                id: true,
                                name: true,
                                url: true,
                                note: true,
                                quantity: true,
                                mostWanted: true,
                                price: { select: { value: true, currency: true } },
                                claims: {
                                    select: {
                                        id: true,
                                        quantity: true,
                                        purchased: true,
                                        claimedBy: { select: { id: true, username: true, name: true } },
                                        publicClaimedBy: { select: { id: true, username: true, name: true } }
                                    }
                                }
                            }
                        }
                    },
                    orderBy: { displayOrder: "asc" }
                }
            },
            orderBy: { name: "asc" }
        })
    ]);

    const payload = {
        exportedAt: new Date().toISOString(),
        users: users.map((u) => ({
            id: u.id,
            username: u.username,
            name: u.name,
            email: u.email,
            roleId: u.role.id,
            groups: u.UserGroupMembership.map((m) => ({
                id: m.group.id,
                name: m.group.name,
                roleId: m.role.id
            }))
        })),
        groups,
        lists: lists.map((l) => ({
            id: l.id,
            name: l.name,
            description: l.description,
            public: l.public,
            owner: l.owner,
            group: l.group,
            items: l.items.map(({ item, displayOrder, approved }) => ({
                id: item.id,
                name: item.name,
                url: item.url,
                note: item.note,
                quantity: item.quantity,
                mostWanted: item.mostWanted,
                price: item.price,
                displayOrder,
                approved,
                claims: item.claims.map((c) => ({
                    id: c.id,
                    quantity: c.quantity,
                    purchased: c.purchased,
                    claimedBy: c.claimedBy ?? c.publicClaimedBy
                }))
            }))
        }))
    };

    const filename = `wishlist-export-${new Date().toISOString().slice(0, 10)}.json`;

    return new Response(JSON.stringify(payload, null, 2), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
            "Content-Disposition": `attachment; filename="${filename}"`
        }
    });
};
