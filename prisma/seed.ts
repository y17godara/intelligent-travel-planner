import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("🌱 Starting database seed...");

  // Create a default user
  const user = await prisma.user.upsert({
    where: { id: "default-user" },
    update: {},
    create: {
      id: "default-user",
      name: "Demo User",
      email: "demo@example.com",
    },
  });

  console.log("✅ User created:", user.id);

  // Create a sample trip
  const trip = await prisma.trip.create({
    data: {
      userId: user.id,
      title: "Sample Paris Trip",
      destination: "Paris",
      description: "A 3-day romantic getaway to Paris",
      days: 3,
      budget: "Moderate",
      interests: ["Cultural", "Food & Cuisine", "Historical Sites"],
      dayPlans: {
        create: [
          {
            day: 1,
            title: "Arrival & Eiffel Tower",
            activities: {
              create: [
                {
                  place: "Eiffel Tower",
                  description:
                    "Visit the iconic Eiffel Tower, take the lift to the top for panoramic views of Paris",
                  time: "14:00 - 16:30",
                  sequence: 1,
                  location: {
                    create: {
                      latitude: 48.8584,
                      longitude: 2.2945,
                      address: "Eiffel Tower, Paris, France",
                    },
                  },
                },
                {
                  place: "Seine River Cruise",
                  description:
                    "Evening dinner cruise along the Seine River with views of illuminated monuments",
                  time: "19:00 - 22:00",
                  sequence: 2,
                  location: {
                    create: {
                      latitude: 48.8566,
                      longitude: 2.3522,
                      address: "Seine River, Paris, France",
                    },
                  },
                },
              ],
            },
          },
          {
            day: 2,
            title: "Museums & Montmartre",
            activities: {
              create: [
                {
                  place: "Louvre Museum",
                  description:
                    "Explore the world famous Louvre Museum, home to the Mona Lisa and Venus de Milo",
                  time: "09:00 - 13:00",
                  sequence: 1,
                  location: {
                    create: {
                      latitude: 48.861,
                      longitude: 2.3359,
                      address: "Louvre, Paris, France",
                    },
                  },
                },
                {
                  place: "Montmartre & Sacré-Cœur",
                  description:
                    "Walk through the charming streets of Montmartre, visit the Sacré-Cœur Basilica",
                  time: "14:00 - 17:00",
                  sequence: 2,
                  location: {
                    create: {
                      latitude: 48.8867,
                      longitude: 2.3431,
                      address: "Montmartre, Paris, France",
                    },
                  },
                },
              ],
            },
          },
          {
            day: 3,
            title: "Versailles & Shopping",
            activities: {
              create: [
                {
                  place: "Palace of Versailles",
                  description:
                    "Day trip to the magnificent Palace of Versailles with stunning gardens",
                  time: "09:00 - 14:00",
                  sequence: 1,
                  location: {
                    create: {
                      latitude: 48.8047,
                      longitude: 2.1204,
                      address: "Palace of Versailles, France",
                    },
                  },
                },
                {
                  place: "Champs-Élysées Shopping",
                  description:
                    "Shop at luxury brands on the famous Champs-Élysées avenue",
                  time: "15:00 - 18:00",
                  sequence: 2,
                  location: {
                    create: {
                      latitude: 48.8698,
                      longitude: 2.307,
                      address: "Champs-Élysées, Paris, France",
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("✅ Sample trip created:", trip.title);
  console.log("🌱 Database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
