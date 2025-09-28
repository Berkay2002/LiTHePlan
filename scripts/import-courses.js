// scripts/import-courses.js
// Script to import course data from new-real-courses.json into Supabase

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!(supabaseUrl && supabaseKey)) {
  console.error("Missing Supabase environment variables");
  console.error("Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const RATE_LIMIT_DELAY_MS = 100;

async function importCourses() {
  console.log("Starting course data import...");

  try {
    // Read the course data
    const coursesPath = path.join(
      process.cwd(),
      "data",
      "new-real-courses.json"
    );
    const coursesData = JSON.parse(fs.readFileSync(coursesPath, "utf8"));

    console.log(`Found ${coursesData.length} courses to import`);

    // Import in batches for better performance
    const batchSize = 100;
    let imported = 0;
    let errors = 0;

    for (let i = 0; i < coursesData.length; i += batchSize) {
      const batch = coursesData.slice(i, i + batchSize);

      console.log(
        `Importing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(coursesData.length / batchSize)} (${batch.length} courses)`
      );

      try {
        const { data, error } = await supabase.from("courses").upsert(
          batch.map((course) => ({
            id: course.id,
            name: course.name,
            credits: Number.parseFloat(course.credits), // Handle decimal credits like 7.5
            level: course.level,
            term: course.term || [],
            period: course.period || [],
            block: course.block || [],
            pace: course.pace,
            examination: course.examination || [],
            campus: course.campus,
            programs: course.programs || [],
            notes: course.notes || "",
          })),
          {
            onConflict: "id",
          }
        );

        if (error) {
          console.error("Batch error:", error);
          errors += batch.length;
        } else {
          imported += batch.length;
          console.log(`Batch ${Math.floor(i / batchSize) + 1} completed`);
        }
      } catch (batchError) {
        console.error("Batch failed:", batchError);
        errors += batch.length;
      }

      // Small delay to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY_MS));
    }

    console.log("\nImport Summary:");
    console.log(`Successfully imported: ${imported} courses`);
    console.log(`Failed: ${errors} courses`);
    console.log(`Total processed: ${coursesData.length} courses`);

    // Verify the import
    const { count, error: countError } = await supabase
      .from("courses")
      .select("*", { count: "exact", head: true });

    if (!countError) {
      console.log(`Database verification: ${count} courses in database`);
    }
  } catch (error) {
    console.error("Import failed:", error);
    process.exit(1);
  }
}

// Run the import
importCourses()
  .then(() => {
    console.log("Course import completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Import script failed:", error);
    process.exit(1);
  });
