import React, { useState, useRef } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Mail, ExternalLink, X, Send, Loader2 } from 'lucide-react';
import emailjs from '@emailjs/browser';

const HelpPage = () => {
    const faqs = [
        {
            question: "How do I create a new post?",
            answer: "To create a post, verify you are logged in as a faculty member or administrator. Click the 'Create Post' button in the navigation bar. Fill in the title, content, select a community, and optionally upload images or videos."
        },
        {
            question: "Why can't I see the 'Create Post' button?",
            answer: "The 'Create Post' button is restricted to Faculty and Admin roles. Students can view, vote, and comment on posts but cannot create new posts directly."
        },
        {
            question: "How can I join a community?",
            answer: "Communities are open for everyone to view. You can browse all communities from the sidebar or the 'Communities' page. There is no explicit 'join' button needed to view content or participate in discussions."
        },
        {
            question: "Can I delete my comment?",
            answer: "Yes, you can delete your own comments. Navigate to the comment you made, and you should see a delete option (trash icon) if you are the author."
        },
        {
            question: "Who can create new communities?",
            answer: "Only Faculty members and Administrators can create new communities. This ensures that discussion spaces are organized and relevant to academic and campus life."
        }
    ];

    const [openIndex, setOpenIndex] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const form = useRef();

    const sendEmail = (e) => {
        e.preventDefault();
        setIsSending(true);

        // Debugging logs to verify env vars are loaded (remove in production)
        console.log("Service ID:", import.meta.env.VITE_EMAILJS_SERVICE);

        emailjs.sendForm(
            import.meta.env.VITE_EMAILJS_SERVICE,
            import.meta.env.VITE_EMAILJS_TEMPLATE,
            form.current,
            {
                publicKey: import.meta.env.VITE_EMAILJS_USER,
            }
        )
            .then((result) => {
                console.log(result.text);
                alert("Message sent successfully!");
                setIsModalOpen(false);
                setIsSending(false);
                e.target.reset();
            }, (error) => {
                console.error(error.text);
                alert("Failed to send message. Please check console for details.");
                setIsSending(false);
            });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <div className="mx-auto h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                        <HelpCircle className="h-8 w-8 text-indigo-600" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                        How can we help?
                    </h1>
                    <p className="mt-4 text-lg text-gray-600">
                        Find answers to common questions about using the T.I.M.E. Community Platform.
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-10">
                    <div className="divide-y divide-gray-200">
                        {faqs.map((faq, index) => (
                            <div key={index} className="p-6">
                                <button
                                    className="w-full flex justify-between items-center text-left focus:outline-none"
                                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                >
                                    <span className="text-lg font-medium text-gray-900">
                                        {faq.question}
                                    </span>
                                    {openIndex === index ? (
                                        <ChevronUp className="h-5 w-5 text-indigo-500" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5 text-gray-400" />
                                    )}
                                </button>
                                {openIndex === index && (
                                    <div className="mt-4 pr-12">
                                        <p className="text-gray-600">
                                            {faq.answer}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-indigo-50 rounded-xl p-8 text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Still have questions?</h3>
                    <p className="text-gray-600 mb-6">Can't find the answer you're looking for? Reach out to our support team.</p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
                    >
                        <Mail className="w-5 h-5 mr-2" />
                        Contact Support
                    </button>
                </div>
            </div>

            {/* Contact Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsModalOpen(false)}
                    ></div>

                    <div className="relative bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900">Contact Support</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-500 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form ref={form} onSubmit={sendEmail} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    name="user_name"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="Your Name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="user_email"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="your.email@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                <textarea
                                    name="message"
                                    required
                                    rows="4"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                                    placeholder="How can we help you?"
                                ></textarea>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isSending}
                                    className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isSending ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5 mr-2" />
                                            Send Message
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HelpPage;
