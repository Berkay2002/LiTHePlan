#!/usr/bin/env node

/**
 * Course Statistics Fetcher
 *
 * This script connects to Supabase and fetches comprehensive statistics
 * about the courses in the database for README updates.
 *
 * Usage: node scripts/fetch-course-stats.js
 */

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!(supabaseUrl && supabaseKey)) {
  console.error("Error: Missing Supabase environment variables");
  console.error(
    "Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const CONSOLE_DIVIDER_LENGTH = 50;
const PERCENTAGE_SCALE = 100;

async function fetchCourseStatistics() {
  console.log("🔍 Fetching course statistics from Supabase...\n");

  try {
    // Fetch all courses
    const { data: courses, error } = await supabase.from("courses").select("*");

    if (error) {
      throw error;
    }

    if (!courses || courses.length === 0) {
      console.log("❌ No courses found in the database");
      return;
    }

    console.log(`✅ Successfully fetched ${courses.length} courses\n`);

    // Calculate statistics
    const stats = calculateStatistics(courses);

    // Display results
    displayStatistics(stats);

    return stats;
  } catch (error) {
    console.error("❌ Error fetching courses:", error.message);
    process.exit(1);
  }
}

function calculateStatistics(courses) {
  const stats = {
    total: courses.length,
    byLevel: {},
    byCampus: {},
    byCredits: {},
    byPace: {},
    byPrograms: {},
    withNotes: 0,
    withoutNotes: 0,
    byTerm: {},
    byPeriod: {},
    byBlock: {},
    byExamination: {},
    averageCredits: 0,
    uniquePrograms: new Set(),
    coursesPerProgram: {},
  };

  courses.forEach((course) => {
    // Level distribution
    stats.byLevel[course.level] = (stats.byLevel[course.level] || 0) + 1;

    // Campus distribution
    stats.byCampus[course.campus] = (stats.byCampus[course.campus] || 0) + 1;

    // Credits distribution
    const creditsKey = `${course.credits}hp`;
    stats.byCredits[creditsKey] = (stats.byCredits[creditsKey] || 0) + 1;

    // Pace distribution
    stats.byPace[course.pace] = (stats.byPace[course.pace] || 0) + 1;

    // Notes
    if (course.notes && course.notes.trim()) {
      stats.withNotes++;
    } else {
      stats.withoutNotes++;
    }

    // Term distribution (courses can have multiple terms)
    if (Array.isArray(course.term)) {
      course.term.forEach((term) => {
        const termKey = `Term ${term}`;
        stats.byTerm[termKey] = (stats.byTerm[termKey] || 0) + 1;
      });
    }

    // Period distribution
    if (Array.isArray(course.period)) {
      course.period.forEach((period) => {
        const periodKey = `Period ${period}`;
        stats.byPeriod[periodKey] = (stats.byPeriod[periodKey] || 0) + 1;
      });
    }

    // Block distribution
    if (Array.isArray(course.block)) {
      course.block.forEach((block) => {
        const blockKey = `Block ${block}`;
        stats.byBlock[blockKey] = (stats.byBlock[blockKey] || 0) + 1;
      });
    }

    // Examination types
    if (Array.isArray(course.examination)) {
      course.examination.forEach((exam) => {
        stats.byExamination[exam] = (stats.byExamination[exam] || 0) + 1;
      });
    }

    // Program analysis
    if (Array.isArray(course.programs)) {
      course.programs.forEach((program) => {
        stats.uniquePrograms.add(program);
        stats.coursesPerProgram[program] =
          (stats.coursesPerProgram[program] || 0) + 1;
      });
    }
  });

  // Calculate average credits
  stats.averageCredits =
    courses.reduce((sum, course) => sum + course.credits, 0) / courses.length;

  // Convert Set to Array for display
  stats.uniqueProgramsArray = Array.from(stats.uniquePrograms);

  return stats;
}

const formatPercentage = (count, total) =>
  ((count / total) * PERCENTAGE_SCALE).toFixed(1);

function displayStatistics(stats) {
  console.log("📊 COURSE STATISTICS SUMMARY");
  console.log("=".repeat(CONSOLE_DIVIDER_LENGTH));

  console.log(`\n📚 TOTAL COURSES: ${stats.total}`);

  console.log("\n🎓 LEVEL DISTRIBUTION:");
  Object.entries(stats.byLevel)
    .sort(([, a], [, b]) => b - a)
    .forEach(([level, count]) => {
      const percentage = formatPercentage(count, stats.total);
      console.log(`   ${level}: ${count} (${percentage}%)`);
    });

  console.log("\n🏫 CAMPUS DISTRIBUTION:");
  Object.entries(stats.byCampus)
    .sort(([, a], [, b]) => b - a)
    .forEach(([campus, count]) => {
      const percentage = formatPercentage(count, stats.total);
      console.log(`   ${campus}: ${count} (${percentage}%)`);
    });

  console.log("\n💳 CREDITS DISTRIBUTION:");
  Object.entries(stats.byCredits)
    .sort(([, a], [, b]) => b - a)
    .forEach(([credits, count]) => {
      const percentage = formatPercentage(count, stats.total);
      console.log(`   ${credits}: ${count} (${percentage}%)`);
    });

  console.log("\n⚡ PACE DISTRIBUTION:");
  Object.entries(stats.byPace)
    .sort(([, a], [, b]) => b - a)
    .forEach(([pace, count]) => {
      const percentage = formatPercentage(count, stats.total);
      console.log(`   ${pace}: ${count} (${percentage}%)`);
    });

  console.log("\n📅 TERM DISTRIBUTION:");
  Object.entries(stats.byTerm)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([term, count]) => {
      const percentage = formatPercentage(count, stats.total);
      console.log(`   ${term}: ${count} (${percentage}%)`);
    });

  console.log("\n⏰ PERIOD DISTRIBUTION:");
  Object.entries(stats.byPeriod)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([period, count]) => {
      const percentage = formatPercentage(count, stats.total);
      console.log(`   ${period}: ${count} (${percentage}%)`);
    });

  console.log("\n🧱 BLOCK DISTRIBUTION:");
  Object.entries(stats.byBlock)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([block, count]) => {
      const percentage = formatPercentage(count, stats.total);
      console.log(`   ${block}: ${count} (${percentage}%)`);
    });

  console.log("\n📝 EXAMINATION TYPES:");
  Object.entries(stats.byExamination)
    .sort(([, a], [, b]) => b - a)
    .forEach(([exam, count]) => {
      const percentage = formatPercentage(count, stats.total);
      console.log(`   ${exam}: ${count} (${percentage}%)`);
    });

  console.log("\n📋 NOTES/RESTRICTIONS:");
  const notesPercentageValue =
    (stats.withNotes / stats.total) * PERCENTAGE_SCALE;
  const notesPercentage = notesPercentageValue.toFixed(1);
  console.log(
    `   Courses with notes: ${stats.withNotes} (${notesPercentage}%)`
  );
  console.log(
    `   Courses without notes: ${stats.withoutNotes} (${(
      PERCENTAGE_SCALE - notesPercentageValue
    ).toFixed(1)}%)`
  );

  console.log("\n🎯 PROGRAM COVERAGE:");
  console.log(`   Total unique programs: ${stats.uniqueProgramsArray.length}`);
  console.log(
    `   Average credits per course: ${stats.averageCredits.toFixed(1)}hp`
  );

  console.log("\n📊 TOP PROGRAMS BY COURSE COUNT:");
  Object.entries(stats.coursesPerProgram)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .forEach(([program, count]) => {
      console.log(`   ${program}: ${count} courses`);
    });

  console.log("\n📋 ALL PROGRAMS:");
  stats.uniqueProgramsArray.sort().forEach((program) => {
    console.log(`   - ${program}`);
  });

  console.log("\n" + "=".repeat(50));
  console.log("✅ Statistics generation complete!");

  // Generate README-friendly summary
  console.log("\n📄 README UPDATE SUMMARY:");
  console.log("=".repeat(30));
  console.log(`Total Courses: ${stats.total}`);
  console.log(
    `Advanced Level: ${stats.byLevel["avancerad nivå"] || 0} courses`
  );
  console.log(`Basic Level: ${stats.byLevel["grundnivå"] || 0} courses`);
  console.log(
    `Campus Distribution: Linköping (${stats.byCampus["Linköping"] || 0}), Norrköping (${stats.byCampus["Norrköping"] || 0}), Distance (${stats.byCampus["Distans"] || 0})`
  );
  console.log(
    `Credit Distribution: ${Object.entries(stats.byCredits)
      .map(([credits, count]) => `${credits} (${count})`)
      .join(", ")}`
  );
  console.log(
    `Programs Covered: ${stats.uniqueProgramsArray.length} different programs`
  );
  console.log(
    `Courses with Restrictions: ${stats.withNotes} (${((stats.withNotes / stats.total) * 100).toFixed(1)}%)`
  );
}

// Run the script
if (require.main === module) {
  fetchCourseStatistics()
    .then(() => {
      console.log("\n🎉 Script completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Script failed:", error);
      process.exit(1);
    });
}

module.exports = { fetchCourseStatistics, calculateStatistics };
