import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

const initializeSiteConfig = async () => {
    try {
        const existingConfig = await prisma.site_config.findFirst();
        if(!existingConfig) {
            await prisma.site_config.create({
                data : {
                    categories : [
                        "Electronics",
                        "Fashion",
                        "Home & Kitchen",
                        "Sports & Fitness",
                    ],
                    subcategories : {
                        "Electronics" : ["Mobile Phones", "Laptops", "Cameras"],
                        "Fashion" : ["Clothing", "Shoes", "Accessories"],
                        "Home & Kitchen" : ["Furniture", "Appliances", "Decor"],
                        "Sports & Fitness" : ["Equipment", "Apparel", "Footwear"]
                    }
                }
            })
        }
    } catch (error) {
        console.log(error)
    }
}

export default initializeSiteConfig;