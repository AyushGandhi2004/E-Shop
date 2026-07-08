import prisma from "../../../../packages/prisma/index.js"
import cron from "node-cron";

cron.schedule("0 * * * *", async () => {
    try {
        const now = new Date();

        const deletedProducts = await prisma.products.deleteMany({
            where : {
                isDeleted : true,
                deletedAt : {
                    lte : now
                }
            }
        })
        console.log(`${deletedProducts.count} products deleted permenantly`)
    } catch (error) {
        console.log(error);
        return;
    }
})