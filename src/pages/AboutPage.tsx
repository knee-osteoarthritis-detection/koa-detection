import { Card, CardContent } from "@/components/ui/card";

const AboutPage = () => {
  return (
    <div className="animate-fade-in">
      <div className="bg-gradient-to-b from-medical-50 to-white py-12">
        <div className="container-custom">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-6">
            About Knee Osteoarthritis
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto text-center">
            Understanding knee osteoarthritis and its impact on millions of patients worldwide
          </p>
        </div>
      </div>
      
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <section className="mb-12">
              <h2 className="section-subtitle">What is Knee Osteoarthritis?</h2>
              <div className="prose max-w-none">
                <p className="text-gray-600 mb-4">
                Osteoarthritis (OA) is a degenerative joint disease in which the tissues in the joint break down
                over time. It is the most common type of arthritis and is more common in elderly people. One
                of the most common forms of osteoarthritis is Knee Osteoarthritis (KOA), which is primarily
                observed due to breakdown of cartilage 1. It leads to pain, stiffness, and a decreased range of
                motion. There are several reasons for KOA to occur apart from aging. Some of them include
                joint injury, repetitive stress, and menopause (specific to females).
                </p>
                <p className="text-gray-600 mb-4">
                  It is the most common form of arthritis, affecting millions of people worldwide, especially those over 50 years of age. 
                  The condition progressively worsens over time, and early diagnosis is essential for effective management.
                </p>
                <p className="text-gray-600">
                  Risk factors include age, obesity, previous joint injuries, repeated stress on the joint, bone deformities, and genetic 
                  factors. Women are more likely to develop knee osteoarthritis, especially after age 50.
                </p>
              </div>
            </section>
            
            <section className="mb-12">
              <h2 className="section-subtitle">The Modified Kellgren-Lawrence Classification System</h2>
              <p className="text-gray-600 mb-4">
                Our simplified Kellgren-Lawrence (KL) scale classifies the severity of knee osteoarthritis on a scale from 0 to 4, focusing on the most clinically relevant grades:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {[
                  {
                    grade: "Grade 0",
                    description: "Normal knee with no features of osteoarthritis",
                    features: "No radiographic features of OA are present"
                  },
                  {
                    grade: "Grade 3",
                    description: "Moderate multiple osteophytes",
                    features: "Moderate multiple osteophytes, definite narrowing of the joint space, and some sclerosis"
                  },
                  {
                    grade: "Grade 4",
                    description: "Severe osteoarthritis",
                    features: "Large osteophytes, marked narrowing of the joint space, severe sclerosis, and definite deformity"
                  }
                ].map((item, index) => (
                  <Card key={index} className={`${index === 2 ? 'border-red-300' : index === 0 ? 'border-green-300' : 'border-orange-300'}`}>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-medical-700">{item.grade}</h3>
                      <p className="text-gray-700 text-sm font-medium">{item.description}</p>
                      <p className="text-gray-600 text-sm mt-2">{item.features}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
            
            <section className="mb-12">
              <h2 className="section-subtitle">Challenges in KOA Diagnosis</h2>
              <p className="text-gray-600 mb-4">
                Traditional diagnosis of knee osteoarthritis involves clinical assessment and radiographic evaluation. However, there are several challenges:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                <li>Subjectivity in radiographic interpretation among radiologists</li>
                <li>Early-stage osteoarthritis may be difficult to detect on standard X-rays</li>
                <li>Time-consuming manual assessment process</li>
                <li>Limited access to specialist radiologists in some regions</li>
                <li>Inconsistency in grading across different healthcare settings</li>
              </ul>
              <p className="text-gray-600">
                Our Deep learning system addresses these challenges by providing objective, consistent, and rapid assessment of knee X-rays
                for osteoarthritis classification according to our modified Kellgren-Lawrence scale.
              </p>
            </section>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-white shadow-md rounded-lg p-6 sticky top-4">
              <h3 className="font-semibold text-lg text-gray-800 mb-4">Quick Facts</h3>
              <ul className="space-y-4">
                {[
                  "Affects over 250 million people worldwide",
                  "Most common in adults over age 50",
                  "Women have higher prevalence than men",
                  "Obesity increases risk by 4-5 times",
                  "Early detection can slow progression",
                  "10-15% of adults over 60 have symptomatic KOA",
                  "Leading cause of chronic disability in older adults"
                ].map((fact, index) => (
                  <li key={index} className="flex items-start">
                    <div className="min-w-6 h-6 rounded-full bg-medical-100 flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-sm font-medium text-medical-700">{index + 1}</span>
                    </div>
                    <span className="text-gray-600">{fact}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 border-t pt-4">
                <a 
                  href="https://www.who.int/news-room/fact-sheets/detail/osteoarthritis" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-center text-medical-600 hover:text-medical-700 group"
                >
                  <img 
                    src="https://www.who.int/images/default-source/default-album/who-emblem-rgb.png" 
                    alt="WHO Logo" 
                    className="w-6 h-6 mr-2"
                  />
                  <span className="text-sm underline">
                    Source: WHO Osteoarthritis Fact Sheet
                  </span>
                  <svg 
                    className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M14 5l7 7m0 0l-7 7m7-7H3" 
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
