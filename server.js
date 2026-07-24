app.post('/api/rsvp', async (req, res) => {
    const { email, primaryName, attending, comments } = req.body;
    
    // HTML email design
    const htmlDesign = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Georgia', serif; background-color: #faf9f6; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 8px; border-top: 6px solid #9ca986; text-align: center;">
            <h1 style="color: #4a5d23; font-size: 24px; margin-top: 0; margin-bottom: 20px;">We've Received Your RSVP!</h1>
            <p style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #555555; margin: 0 0 15px 0;">Thank you so much for responding. We can't wait to celebrate with you on <strong style="color: #333333;">October 25, 2026</strong>.</p>
            <p style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #555555; margin: 0 0 15px 0;">Please save this email so you have the venue and parking details handy for the big day.</p>
            <div style="background-color: #f4f6f1; border: 1px solid #e1e5db; border-radius: 6px; padding: 25px; margin: 30px 0; text-align: left;">
                <h3 style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin-top: 0; color: #4a5d23; font-size: 16px; margin-bottom: 15px; border-bottom: 1px solid #d0d7c6; padding-bottom: 10px;">📍 Venue & Parking Details</h3>
                <p style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #555555; margin: 0 0 15px 0;"><strong style="color: #333333;">Tapestry Hall</strong><br>74 Grand Ave S, Cambridge, ON</p>
                <p style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #555555; margin: 20px 0 5px 0;"><strong style="color: #333333;">Nearby Parking Options:</strong></p>
                <ul style="margin-top: 0; padding-left: 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 15px; color: #555555; line-height: 1.6;">
                    <li style="margin-bottom: 5px;"><strong style="color: #333333;">Parking Lot:</strong> 32 Fraser St</li>
                    <li><strong style="color: #333333;">Parking Garage:</strong> 63 Grand Ave S</li>
                </ul>
            </div>
            <div style="margin-top: 30px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; color: #888888; border-top: 1px solid #eeeeee; padding-top: 20px;">
                Need to reach us directly?<br>Text Filip (226-792-7905) or Ada (226-751-5369).
            </div>
        </div>
    </body>
    </html>
    `;
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "We've Received Your RSVP!",
        html: htmlDesign
    };

    // 2. Fire the email using Nodemailer
    transporter.sendMail(mailOptions, async (error, info) => {
        if (error) {
            console.error('Email error:', error);
            return res.status(500).send("Error sending email");
        }

        // 3. Once the email is sent, forward the data to Make.com for Excel
        try {
            const makeResponse = await fetch('https://hook.us2.make.com/7vpctcbnrcxwloabqjvrbqee1vq4brnk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Forward the exact payload you received from React
                body: JSON.stringify(req.body)
            });

            if (!makeResponse.ok) {
                throw new Error('Failed to reach Make.com');
            }

            // 4. Tell React everything worked perfectly
            res.status(200).send("RSVP logged to Excel and email sent successfully!");

        } catch (makeError) {
            console.error('Make.com error:', makeError);
            res.status(500).send("Email sent, but failed to log to Excel");
        }
    });
});