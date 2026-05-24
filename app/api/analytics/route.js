import { NextResponse } from "next/server";
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// Helper: verify admin JWT
async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return false;
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function GET() {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
  }

  const propertyId = process.env.GA_PROPERTY_ID;
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const credentialsJson = process.env.GOOGLE_CREDENTIALS_JSON;

  if (!propertyId || (!credentialsPath && !credentialsJson)) {
    return NextResponse.json({ 
      success: false, 
      needsSetup: true,
      error: "Google Analytics credentials missing."
    }, { status: 200 }); // Return 200 so UI can handle the setup state cleanly
  }

  try {
    const clientOptions = {};
    if (process.env.GOOGLE_CREDENTIALS_JSON) {
      // Prioritize the raw JSON object from Vercel env
      clientOptions.credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
    }
    
    const analyticsDataClient = new BetaAnalyticsDataClient(clientOptions);

    // 1. Get Traffic over last 7 days
    const [trafficReport] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }],
      orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }]
    });

    // 2. Get Top Projects/Pages (URLs)
    const [pagesReport] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'screenPageViews' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 5
    });

    // Format Data for our UI
    const trafficData = trafficReport.rows.map(row => Number(row.metricValues[0].value));
    const totalVisitors = trafficData.reduce((a, b) => a + b, 0);
    
    // Fallback if data is too small to show properly in chart
    const finalTrafficData = trafficData.length > 0 ? trafficData : [0, 0, 0, 0, 0, 0, 0];

    const topProjects = pagesReport.rows.map(row => ({
      name: row.dimensionValues[0].value,
      views: Number(row.metricValues[0].value),
      clicks: Math.floor(Number(row.metricValues[0].value) * 0.4), // Simulated clicks based on views
    }));

    const responseData = {
      totalVisitors: totalVisitors.toLocaleString(),
      visitorsGrowth: "Live",
      resumeDownloads: "N/A", // Needs custom event tracking
      resumeGrowth: "Live",
      topProjects: topProjects.length > 0 ? topProjects : [
        { name: "Portfolio Root (/)", views: totalVisitors, clicks: 0 }
      ],
      clickTracking: [
         // We can expand this with custom events query in GA later
        { label: "Tracked Page Views", count: trafficReport.rows.reduce((acc, row) => acc + Number(row.metricValues[1].value), 0), icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
        { label: "Active Users (7 Days)", count: totalVisitors, icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" }
      ],
      trafficData: finalTrafficData
    };

    return NextResponse.json({ success: true, data: responseData });
  } catch (error) {
    console.error("Google Analytics API Error:", error);
    return NextResponse.json({ 
      success: false, 
      needsSetup: true,
      error: error.message 
    }, { status: 200 });
  }
}
