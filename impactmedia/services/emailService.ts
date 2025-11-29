
import { EMAILJS_CONFIG } from '../constants';

export const emailService = {
  sendEmail: async (templateId: string, templateParams: Record<string, any>) => {
    const data = {
      service_id: EMAILJS_CONFIG.SERVICE_ID,
      template_id: templateId,
      user_id: EMAILJS_CONFIG.PUBLIC_KEY,
      template_params: templateParams
    };

    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`EmailJS Failed: ${errorText}`);
      }
      return true;
    } catch (error: any) {
      console.error('Email Error:', error);
      return false;
    }
  },

  sendCastingStatus: async (name: string, email: string, status: 'approved' | 'rejected') => {
    const subject = status === 'approved' ? 'Role Match Confirmed: Next Steps' : 'Casting Update: Profile Status';
    const message = status === 'approved'
      ? `We are pleased to inform you that your profile has been flagged for an upcoming production archetype. Our casting director will contact you shortly with specific details.`
      : `Thank you for your submission to AI Impact Media. While your current archetype does not match our immediate production needs, we will keep your data in the mainframe for future cycles.`;

    return emailService.sendEmail(EMAILJS_CONFIG.CASTING_TEMPLATE_ID, {
      to_name: name,
      to_email: email,
      subject: subject,
      message: message,
      status_label: status.toUpperCase()
    });
  },

  sendSponsorStatus: async (orgName: string, email: string, status: 'approved' | 'rejected') => {
    const subject = status === 'approved' ? 'Partnership Proposal: Approved' : 'Update regarding your Sponsorship Inquiry';
    const message = status === 'approved'
      ? `We are excited to move forward with ${orgName} as a strategic partner. Attached (in follow-up) you will find our media kit and initial agreement terms.`
      : `We appreciate your interest in partnering with AI Impact Media. After review, we are unable to accommodate your proposal in our current slate.`;

    return emailService.sendEmail(EMAILJS_CONFIG.SPONSOR_TEMPLATE_ID, {
      to_name: orgName,
      to_email: email,
      subject: subject,
      message: message,
      status_label: status.toUpperCase()
    });
  }
};
