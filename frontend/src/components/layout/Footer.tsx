import React, { useState } from 'react';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Heart } from 'lucide-react';
import Modal from '../ui/Modal';

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const currentYear = new Date().getFullYear();

  // Modal states
  const [modals, setModals] = useState({
    aboutUs: false,
    howItWorks: false,
    faqs: false,
    contactUs: false,
    privacyPolicy: false,
    termsConditions: false,
    cookies: false
  });

  const toggleModal = (modalName: keyof typeof modals) => {
    setModals(prev => ({
      ...prev,
      [modalName]: !prev[modalName]
    }));
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setNewsletterStatus('error');
      return;
    }

    setNewsletterStatus('loading');
    
    // Simulate API call
    setTimeout(() => {
      setNewsletterStatus('success');
      setEmail('');
      setTimeout(() => setNewsletterStatus('idle'), 3000);
    }, 1000);
  };

  const socialLinks = {
    facebook: 'https://facebook.com',
    twitter: 'https://twitter.com',
    instagram: 'https://instagram.com/clothrental',
    linkedin: 'https://linkedin.com'
  };

  return (
    <footer className="bg-gray-950 text-gray-100 mt-20">
      {/* Newsletter Section */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl font-serif font-light text-white mb-2">
                Stay Updated
              </h3>
              <p className="text-gray-400 font-light">
                Subscribe to our newsletter for exclusive deals and new arrivals
              </p>
            </div>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white font-light"
              />
              <button
                type="submit"
                disabled={newsletterStatus === 'loading'}
                className="px-6 py-3 bg-white text-gray-950 rounded-lg hover:bg-gray-100 transition-colors font-light text-sm uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {newsletterStatus === 'loading' ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
            {newsletterStatus === 'success' && (
              <p className="text-green-400 text-sm font-light mt-2">✓ Successfully subscribed!</p>
            )}
            {newsletterStatus === 'error' && (
              <p className="text-red-400 text-sm font-light mt-2">✗ Please enter a valid email</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <div className="col-span-1 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                <span className="text-gray-950 font-serif font-semibold text-lg">C</span>
              </div>
              <span className="font-serif text-xl text-white font-light">Cloth Rental</span>
            </div>
            <p className="text-gray-400 text-sm font-light leading-relaxed mb-4">
              Premium fashion rental platform providing luxury designer pieces for every occasion.
            </p>
            <div className="flex gap-4">
              <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-300">
                <Facebook className="w-5 h-5" />
              </a>
              <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-300">
                <Twitter className="w-5 h-5" />
              </a>
              <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-300">
                <Instagram className="w-5 h-5" />
              </a>
              <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-300">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Collections */}
          <div>
            <h4 className="text-white font-semibold uppercase tracking-widest text-xs mb-6 border-b border-gray-800 pb-4">
              Collections
            </h4>
            <ul className="flex flex-col gap-3">
              <li>
                <a href="/products?category=women" className="text-gray-400 hover:text-white transition-colors text-sm font-light">
                  Women's Fashion
                </a>
              </li>
              <li>
                <a href="/products?category=men" className="text-gray-400 hover:text-white transition-colors text-sm font-light">
                  Men's Fashion
                </a>
              </li>
              <li>
                <a href="/products?category=footwear" className="text-gray-400 hover:text-white transition-colors text-sm font-light">
                  Footwear
                </a>
              </li>
              <li>
                <a href="/products" className="text-gray-400 hover:text-white transition-colors text-sm font-light">
                  New Arrivals
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold uppercase tracking-widest text-xs mb-6 border-b border-gray-800 pb-4">
              Support
            </h4>
            <ul className="flex flex-col gap-3">
              <li>
                <button
                  onClick={() => toggleModal('aboutUs')}
                  className="text-gray-400 hover:text-white transition-colors text-sm font-light cursor-pointer"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => toggleModal('howItWorks')}
                  className="text-gray-400 hover:text-white transition-colors text-sm font-light cursor-pointer"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => toggleModal('faqs')}
                  className="text-gray-400 hover:text-white transition-colors text-sm font-light cursor-pointer"
                >
                  FAQs
                </button>
              </li>
              <li>
                <button
                  onClick={() => toggleModal('contactUs')}
                  className="text-gray-400 hover:text-white transition-colors text-sm font-light cursor-pointer"
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold uppercase tracking-widest text-xs mb-6 border-b border-gray-800 pb-4">
              Get in Touch
            </h4>
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-400 text-sm font-light">Email</p>
                  <a href="mailto:support@clothrental.com" className="text-white text-sm hover:text-gray-200 transition-colors">
                    support@clothrental.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-400 text-sm font-light">Phone</p>
                  <a href="tel:+918001234567" className="text-white text-sm hover:text-gray-200 transition-colors">
                    +91 800 123-4567
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-400 text-sm font-light">Location</p>
                  <p className="text-white text-sm">
                    Mumbai, India
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-xs font-light">
            © {currentYear} Cloth Rental. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <button
              onClick={() => toggleModal('privacyPolicy')}
              className="text-gray-400 hover:text-white transition-colors text-xs font-light cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => toggleModal('termsConditions')}
              className="text-gray-400 hover:text-white transition-colors text-xs font-light cursor-pointer"
            >
              Terms & Conditions
            </button>
            <button
              onClick={() => toggleModal('cookies')}
              className="text-gray-400 hover:text-white transition-colors text-xs font-light cursor-pointer"
            >
              Cookies
            </button>
          </div>
          <p className="text-gray-400 text-xs font-light flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-500" /> by Cloth Rental
          </p>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={modals.aboutUs}
        title="About Cloth Rental"
        onClose={() => toggleModal('aboutUs')}
      >
        <div className="space-y-4">
          <p className="text-gray-700 font-light leading-relaxed">
            Cloth Rental is your premier platform for accessing luxury fashion without the commitment of ownership. We believe that sustainable fashion should be accessible to everyone.
          </p>
          <p className="text-gray-700 font-light leading-relaxed">
            Founded in 2023, we've revolutionized how people enjoy designer clothing by offering premium pieces at a fraction of the retail price. Our carefully curated selection includes pieces from top designers and emerging brands.
          </p>
          <h4 className="font-semibold text-gray-900 mt-6 mb-3">Our Mission</h4>
          <p className="text-gray-700 font-light leading-relaxed">
            To make luxury fashion affordable, sustainable, and accessible to everyone. We're committed to reducing fashion waste while helping our customers look their best.
          </p>
          <h4 className="font-semibold text-gray-900 mt-6 mb-3">Why Choose Us?</h4>
          <ul className="list-disc list-inside text-gray-700 font-light space-y-2">
            <li>Curated selection of designer and premium brands</li>
            <li>Competitive rental prices compared to retail</li>
            <li>Flexible rental periods (3 to 30 days)</li>
            <li>Professional dry cleaning included</li>
            <li>Easy online booking and returns</li>
            <li>Committed to sustainable fashion</li>
          </ul>
        </div>
      </Modal>

      <Modal
        isOpen={modals.howItWorks}
        title="How It Works"
        onClose={() => toggleModal('howItWorks')}
      >
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span className="bg-gray-950 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">1</span>
              Browse & Select
            </h4>
            <p className="text-gray-700 font-light ml-10">
              Explore our collection of designer pieces. Filter by category, price, or style to find what you're looking for.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span className="bg-gray-950 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">2</span>
              Choose Your Dates
            </h4>
            <p className="text-gray-700 font-light ml-10">
              Select your rental period (minimum 3 days). We'll show you the pricing based on your chosen dates.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span className="bg-gray-950 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">3</span>
              Checkout
            </h4>
            <p className="text-gray-700 font-light ml-10">
              Add items to your cart and proceed to checkout. We accept all major payment methods including credit cards.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span className="bg-gray-950 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">4</span>
              Receive Your Items
            </h4>
            <p className="text-gray-700 font-light ml-10">
              Your items will be carefully packaged and shipped to you. We provide free shipping on all orders.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span className="bg-gray-950 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">5</span>
              Enjoy & Return
            </h4>
            <p className="text-gray-700 font-light ml-10">
              Wear and enjoy your rental! Return the items within your rental period in a pre-paid box. Professional cleaning is included.
            </p>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={modals.faqs}
        title="Frequently Asked Questions"
        onClose={() => toggleModal('faqs')}
      >
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">What is the minimum rental period?</h4>
            <p className="text-gray-700 font-light">
              The minimum rental period is 3 days. After that, you can extend your rental in 1-day increments.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Do you offer free shipping?</h4>
            <p className="text-gray-700 font-light">
              Yes! We provide free shipping on all rental orders both ways - delivery and returns.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">What if the item doesn't fit?</h4>
            <p className="text-gray-700 font-light">
              We allow exchanges within 2 days of receiving your order. Simply contact our support team with photos and we'll arrange a replacement.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">What if I damage the item?</h4>
            <p className="text-gray-700 font-light">
              Normal wear and tear is expected and covered. However, major damage or stains may incur a damage fee which will be communicated to you.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">How are items cleaned?</h4>
            <p className="text-gray-700 font-light">
              All items are professionally dry-cleaned after each rental to ensure they arrive fresh and ready to wear.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Can I extend my rental?</h4>
            <p className="text-gray-700 font-light">
              Yes! You can extend your rental by paying additional fees. Extensions are available subject to availability.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h4>
            <p className="text-gray-700 font-light">
              We accept credit cards (Visa, Mastercard, AMEX), UPI, and digital wallets through our Razorpay integration.
            </p>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={modals.contactUs}
        title="Contact Us"
        onClose={() => toggleModal('contactUs')}
      >
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Get in Touch</h4>
            <p className="text-gray-700 font-light">
              We'd love to hear from you! Whether you have a question about rental, sizing, or anything else, our team is here to help.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="font-semibold text-gray-900 min-w-fit">Email:</span>
                <a href="mailto:support@clothrental.com" className="text-blue-600 hover:text-blue-800 font-light">
                  support@clothrental.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-semibold text-gray-900 min-w-fit">Phone:</span>
                <a href="tel:+918001234567" className="text-blue-600 hover:text-blue-800 font-light">
                  +91 800 123-4567
                </a>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-semibold text-gray-900 min-w-fit">Location:</span>
                <span className="text-gray-700 font-light">
                  Mumbai, India
                </span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Response Time</h4>
            <p className="text-gray-700 font-light">
              We typically respond to inquiries within 24 hours on business days. For urgent issues, please call us directly.
            </p>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={modals.privacyPolicy}
        title="Privacy Policy"
        onClose={() => toggleModal('privacyPolicy')}
      >
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">1. Information We Collect</h4>
          <p className="text-gray-700 font-light">
            We collect information you provide directly to us such as when you create an account, place an order, or contact us. This includes your name, email address, phone number, payment information, and rental preferences.
          </p>

          <h4 className="font-semibold text-gray-900">2. How We Use Your Information</h4>
          <p className="text-gray-700 font-light">
            We use the information we collect to process your rentals, improve our services, communicate with you, and comply with legal obligations.
          </p>

          <h4 className="font-semibold text-gray-900">3. Data Security</h4>
          <p className="text-gray-700 font-light">
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
          </p>

          <h4 className="font-semibold text-gray-900">4. Third-Party Services</h4>
          <p className="text-gray-700 font-light">
            We use third-party payment processors and shipping partners. These partners maintain their own privacy policies.
          </p>

          <h4 className="font-semibold text-gray-900">5. Your Rights</h4>
          <p className="text-gray-700 font-light">
            You have the right to access, correct, or delete your personal information. Contact us at support@clothrental.com to exercise these rights.
          </p>

          <h4 className="font-semibold text-gray-900">6. Changes to This Policy</h4>
          <p className="text-gray-700 font-light">
            We may update this privacy policy from time to time. We'll notify you of any changes by posting the updated policy on our website.
          </p>
        </div>
      </Modal>

      <Modal
        isOpen={modals.termsConditions}
        title="Terms & Conditions"
        onClose={() => toggleModal('termsConditions')}
      >
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">1. Acceptance of Terms</h4>
          <p className="text-gray-700 font-light">
            By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.
          </p>

          <h4 className="font-semibold text-gray-900">2. Rental Agreement</h4>
          <p className="text-gray-700 font-light">
            By renting an item, you agree to return it in the same condition as received (normal wear and tear excepted). Damages beyond normal wear may incur additional fees.
          </p>

          <h4 className="font-semibold text-gray-900">3. Rental Dates</h4>
          <p className="text-gray-700 font-light">
            Rental periods begin on the delivery date and end on the return date specified in your order. Late returns may result in additional charges.
          </p>

          <h4 className="font-semibold text-gray-900">4. Cancellation & Refunds</h4>
          <p className="text-gray-700 font-light">
            Cancellations must be made at least 5 days before the rental start date for a full refund. Cancellations within 5 days are non-refundable.
          </p>

          <h4 className="font-semibold text-gray-900">5. Liability</h4>
          <p className="text-gray-700 font-light">
            Cloth Rental is not responsible for any indirect, incidental, special, or consequential damages arising from your use of our service.
          </p>

          <h4 className="font-semibold text-gray-900">6. Dispute Resolution</h4>
          <p className="text-gray-700 font-light">
            Any disputes arising from this agreement shall be resolved through binding arbitration.
          </p>
        </div>
      </Modal>

      <Modal
        isOpen={modals.cookies}
        title="Cookie Policy"
        onClose={() => toggleModal('cookies')}
      >
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">What Are Cookies?</h4>
          <p className="text-gray-700 font-light">
            Cookies are small text files stored on your device that help us remember your preferences and improve your browsing experience.
          </p>

          <h4 className="font-semibold text-gray-900">Types of Cookies We Use</h4>
          <ul className="list-disc list-inside text-gray-700 font-light space-y-2">
            <li><strong>Essential Cookies:</strong> Required for website functionality and security</li>
            <li><strong>Performance Cookies:</strong> Help us understand how you use our website</li>
            <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
            <li><strong>Marketing Cookies:</strong> Track your activity for personalized advertising</li>
          </ul>

          <h4 className="font-semibold text-gray-900">Managing Cookies</h4>
          <p className="text-gray-700 font-light">
            You can control cookie preferences in your browser settings. However, disabling essential cookies may affect website functionality.
          </p>

          <h4 className="font-semibold text-gray-900">Third-Party Cookies</h4>
          <p className="text-gray-700 font-light">
            We may allow third parties to set cookies on our website for analytics, advertising, and social media integration purposes.
          </p>

          <h4 className="font-semibold text-gray-900">Updates</h4>
          <p className="text-gray-700 font-light">
            We may update this cookie policy. Check back periodically for the latest information.
          </p>
        </div>
      </Modal>
    </footer>
  );
};

export default Footer;