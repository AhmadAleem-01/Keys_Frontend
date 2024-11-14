const XLSX = require("xlsx");
const fs = require("fs");

// Load the ODS file
const workbook = XLSX.readFile("mortice data.ods");

// Get the first worksheet
const worksheet = workbook.Sheets[workbook.SheetNames[0]];

// Convert worksheet to JSON array format
const data = XLSX.utils.sheet_to_json(worksheet);

// Map each row to the desired JSON format
const jsonData = data.map(row => ({
    Reference_Number: row["Reference_Number"] || "",
    Biting_points: row["Biting_points"] || 0,
    Decoding: (row["Decoding"] || "").toString(),
    Shoulder_Distance: (row["Shoulder_Distance"] || "").toString(),
    Depth: (row["Depth"] || "").toString(),
    Reverse: row["Reverse"] === "true",
    widthUnCutKeys: [parseFloat(row["widthUnCutKeys"] || 0)],
    hasVariant: row["hasVariant"] === "true"
}));

// Save to a JSON file
fs.writeFileSync("output.json", JSON.stringify(jsonData, null, 2), "utf8");

console.log("Data saved to output.json");
