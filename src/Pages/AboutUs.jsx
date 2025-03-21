import React from "react";

const AboutUs = () => {
  const features = [
    {
      title: "AI-Powered Diagnostics",
      description:
        "Our AI-powered diagnostic tool analyzes symptoms and medical history to generate logical, data-driven health insights.",
    },
    {
      title: "Support Communities",
      description:
        "Join support groups to connect with others facing similar health challenges and share experiences.",
    },
    {
      title: "Medical Records Access",
      description:
        "Securely access your previous medical records and diagnostic history for better-informed health decisions.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdd5c9] to-[#fcdcd3] p-6 font-['Barlow']">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-6xl font-bold mb-16 text-gray-800">About Us</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-rose-50 rounded-2xl p-8 md:p-10 shadow-md hover:shadow-lg transition duration-300 border border-gray-100">
            <h2 className="text-4xl font-bold mb-6 text-gray-800">
              We are <span className="text-[#c94a4a]">VAIDYAMITRA</span>
            </h2>
            <p className="text-lg leading-relaxed text-gray-700">
              A patient-focused digital healthcare platform that empowers lives
              through health. We connect with hospital systems to provide
              real-time access to medical records, personalized treatment plans,
              proactive health alerts, and seamless communication between
              patients, doctors, and caregivers. Experience seamless healthcare
              with AI-driven diagnosis, instant doctor consultations, and
              hassle-free medicine purchases—all in one platform.
            </p>
          </div>

          <div className="bg-rose-50 rounded-2xl p-8 md:p-10 shadow-md hover:shadow-lg transition duration-300 border border-gray-100">
            <ul className="space-y-8">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-2 h-2 bg-[#c94a4a] rounded-full mr-4"></div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-800">
                      {feature.title}
                    </h3>
                    <p className="text-gray-700">{feature.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 bg-rose-50 rounded-2xl p-8 md:p-10 shadow-md hover:shadow-lg transition duration-300 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-[#c94a4a] text-4xl font-bold mb-2">
                10,000+
              </div>
              <p className="text-lg text-gray-700">Patients Served</p>
            </div>
            <div className="text-center">
              <div className="text-[#c94a4a] text-4xl font-bold mb-2">500+</div>
              <p className="text-lg text-gray-700">Healthcare Providers</p>
            </div>
            <div className="text-center">
              <div className="text-[#c94a4a] text-4xl font-bold mb-2">24/7</div>
              <p className="text-lg text-gray-700">Support Available</p>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-[#c94a4a]">
            Our Mission
          </h2>
          <p className="text-xl text-gray-700">
            To revolutionize healthcare accessibility and empower patients with
            the information and tools they need to take control of their health
            journey through cutting-edge technology and expert guidance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
