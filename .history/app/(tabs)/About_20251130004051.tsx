import { Globe, Info, Mail, Package, Phone, Recycle } from 'lucide-react';
import React from 'react';

// Constants for styling based on the original React Native colors
const COLORS = {
  primary: 'text-green-600', // A strong green for sustainability
  primaryBg: 'bg-green-600',
  secondary: 'text-blue-800', // A dark blue for contrast and professionalism
  background: 'bg-gray-50',
  text: 'text-gray-900',
  subtleText: 'text-gray-600',
  divider: 'border-gray-200',
  whiteBg: 'bg-white',
};

// --- Helper Components ---

/**
 * Renders a main content section with a title and background.
 * @param title The title of the section.
 * @param children The content inside the section.
 */
const Section = ({ title, children }) => (
  <div className={`mb-6 p-6 ${COLORS.whiteBg} rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl`}>
    <h2 className={`text-2xl font-bold ${COLORS.secondary} mb-4 border-b-2 border-green-500 inline-block pb-1`}>
      {title}
    </h2>
    {children}
  </div>
);

/**
 * Renders a clickable contact item.
 * @param Icon Lucide icon component.
 * @param text The contact detail text (e.g., email address).
 * @param link The URL to open (mailto, tel, or https).
 * @param type The type of contact (email, phone, web) for display text.
 */
const ContactItem = ({ icon: Icon, text, link, type }) => {
  const actionText = type === 'email' ? 'Send Email' : type === 'phone' ? 'Call Now' : 'Visit Site';

  return (
    <div className={`flex items-center py-3 border-b ${COLORS.divider} last:border-b-0`}>
      <Icon size={20} className={`${COLORS.secondary} mr-3 flex-shrink-0`} />
      <span className={`text-sm ${COLORS.text} flex-grow`}>{text}</span>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className={`text-sm font-semibold ${COLORS.primary} ml-4 cursor-pointer hover:underline`}
      >
        {actionText}
      </a>
    </div>
  );
};

// --- Main Component (App) ---
const App = () => {
  const appVersion = '1.2.0'; // Mock version number

  return (
    <div className={`min-h-screen ${COLORS.background} p-4 sm:p-8 font-sans`}>
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <header className="mb-8 pb-4 border-b border-gray-300">
          <h1 className={`text-5xl font-extrabold ${COLORS.primary} tracking-wider`}>
            WasteFlow
          </h1>
          <p className={`text-lg ${COLORS.subtleText} mt-2 font-medium`}>
            Redefining Waste, One Transaction at a Time.
          </p>
        </header>

        {/* Mission & Vision */}
        <Section title="Our Mission">
          <p className={`text-base ${COLORS.text} leading-relaxed mb-4`}>
            <Recycle size={18} className="inline-block mr-2" />
            WasteFlow was founded on the belief that waste is a valuable resource waiting to be repurposed.
            Our mission is to build the most efficient, transparent, and user-friendly platform connecting waste generators (individuals and businesses) directly with recyclers and processors. We aim to maximize resource recovery and minimize landfill burden globally.
          </p>
        </Section>

        <Section title="Our Vision">
          <p className={`text-base ${COLORS.text} leading-relaxed`}>
            <Package size={18} className="inline-block mr-2" />
            To see a circular economy where every waste material is treated as a commodity, driving sustainable growth, empowering local communities, and achieving zero-waste status for cities worldwide.
          </p>
        </Section>

        {/* Why Choose Us */}
        <Section title="The WasteFlow Difference">
          <ul className="space-y-3 list-disc pl-5">
            <li className={`text-base ${COLORS.text}`}>
              <span className="font-semibold">Global Reach, Local Impact:</span> Connects you to verified buyers in your area.
            </li>
            <li className={`text-base ${COLORS.text}`}>
              <span className="font-semibold">Transparency:</span> Real-time tracking and fair market pricing for materials.
            </li>
            <li className={`text-base ${COLORS.text}`}>
              <span className="font-semibold">Sustainability:</span> Direct contribution to verifiable environmental goals.
            </li>
            <li className={`text-base ${COLORS.text}`}>
              <span className="font-semibold">Simplicity:</span> Easy-to-use interface for listing, bidding, and logistics.
            </li>
          </ul>
        </Section>

        {/* Contact Information */}
        <Section title="Get in Touch">
          <div className="space-y-1">
            <ContactItem
              icon={Mail}
              text="support@wasteflowapp.com"
              type="email"
              link="mailto:support@wasteflowapp.com"
            />
            <ContactItem
              icon={Phone}
              text="+1 (800) 555-FLOW"
              type="phone"
              link="tel:+18005553569"
            />
            <ContactItem
              icon={Globe}
              text="www.wasteflow.com"
              type="web"
              link="https://www.wasteflow.com"
            />
          </div>
        </Section>

        {/* Footer/Version */}
        <footer className="mt-10 pt-4 border-t border-gray-300 text-center">
          <div className={`flex items-center justify-center mb-1 ${COLORS.subtleText}`}>
            <Info size={14} className="mr-1" />
            <p className="text-xs font-light">
              Application Version {appVersion}
            </p>
          </div>
          <p className={`text-xs ${COLORS.subtleText} font-light`}>
            © {new Date().getFullYear()} WasteFlow Inc. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;