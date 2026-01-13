import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEOHead({ 
  title = "Meet Point - מצא את נקודת המפגש המושלמת",
  description = "מחשבון נקודת המפגש החכם שחוסך זמן ונסיעה. חישוב הוגן עם תמיכה מלאה בתחבורה ציבורית.",
  path = "/"
}) {
  const siteUrl = "https://meetpointhq.com";
  const fullUrl = `${siteUrl}${path}`;

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Meet Point",
    "url": siteUrl,
    "description": "מחשבון נקודת מפגש חכם המאפשר למצוא את נקודת המפגש האופטימלית בין משתתפים מרובים",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${siteUrl}/MeetPoint`
      }
    }
  };

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullUrl} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Meet Point" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      
      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
    </Helmet>
  );
}