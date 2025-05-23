import datetime
import math
import os


def main(event, context):
    if event['triggerSource'] == "CustomMessage_AdminCreateUser":
        register_link = os.getenv('REGISTRATION_LINK')
        event['response']['emailSubject'] = "Register for the Create Transport Disruptions Data service"
        event['response']['emailMessage'] = template_register(
            event['request']['usernameParameter'],
            event['request']['codeParameter'],
            event['request']['userAttributes']['custom:orgId'],
            register_link
        )
    elif event['triggerSource'] == "CustomMessage_ForgotPassword":
        forgotten_password_link = os.getenv('FORGOTTEN_PASSWORD_LINK')
        contact_link = os.getenv('CONTACT_LINK')

        current_time = datetime.datetime.now(datetime.UTC)

        current_time_plus_one_hour = current_time + datetime.timedelta(hours=1)
        ts = current_time_plus_one_hour.timestamp()

        event['response']['emailSubject'] = "Reset your password"
        event['response']['emailMessage'] = template_forgotten_password(
            event['request']['userAttributes']['email'],
            event['request']['codeParameter'],
            forgotten_password_link, contact_link, math.floor(ts)
        )

    return event


def template_register(username, key, orgId, register_link):
    template = f"""<div style="font-family: Arial, sans-serif; padding-left: 30px">
                       <h1>Create account - Create Transport Disruptions Data service</h1>
                       <p>To create an account to access the Create Transport Disruptions Data service click the link below:</p>
                       <a href="{register_link}?key={key}&email={username}&orgId={orgId}">Link to registration</a>
                       <p>The link is valid for 72 hours for the following email address {username}.</p>
                   </div>"""

    return get_base_template(template)


def template_forgotten_password(email, code, password_link, contact_link, ts):
    email_body = f"""<div style="font-family: Arial, sans-serif; padding-left: 30px">
                       <h1>Recover Password - Create Transport Disruptions Data service</h1>
                       <p>To recover your password for the Create Transport Disruptions Data service click on the link below:</p>
                       <a href="{password_link}?key={code}&user_name={email}&expiry={ts}">Link to reset password</a>
                       <p>The link is valid for 24 hours from the time it was requested.</p>
                       <p>If this wasn't you, please get in touch via the <a href="{contact_link}">contact page</a>.</p>
                    </div>"""

    return get_base_template(email_body)


def get_base_template(message_body):
    base_template = f"""<!DOCTYPE html> <html lang="en"><head><title>Create Transport Disruptions Data service</title></head>
                             <body class="govuk-template-body">
                               <div id="main">
                                 <div>
                                   <header style="font-size: 1rem; line-height: 1.25; height: 60px; border-bottom: 10px solid #1d70b8; font-family: Arial, sans-serif; font-weight: 400; color: #ffffff; background: #0b0c0c;" class="govuk-header">
                                     <div style="font-family: Arial, sans-serif;">
                                       <div style="padding-left: 10px; float: left;">
                                         <a style="font-weight: 700; display: inline-block; font-size: 30px; line-height: 2; text-decoration: none; color: #ffffff;"
                                           href="https://www.gov.uk/"
                                           ><span style="display: inline-block; margin-right: 5px; color: #ffffff;"
                                             ><svg style="position: relative; margin-right: 1px;"
                                               role="presentation"
                                               focusable="false"
                                               xmlns="http://www.w3.org/2000/svg"
                                               viewBox="0 0 132 97"
                                               height="30"
                                               width="36"
                                             >
                                               <path
                                                 fill="currentColor"
                                                 fill-rule="evenodd"
                                                 d="M25 30.2c3.5 1.5 7.7-.2 9.1-3.7 1.5-3.6-.2-7.8-3.9-9.2-3.6-1.4-7.6.3-9.1 3.9-1.4 3.5.3 7.5 3.9 9zM9 39.5c3.6 1.5 7.8-.2 9.2-3.7 1.5-3.6-.2-7.8-3.9-9.1-3.6-1.5-7.6.2-9.1 3.8-1.4 3.5.3 7.5 3.8 9zM4.4 57.2c3.5 1.5 7.7-.2 9.1-3.8 1.5-3.6-.2-7.7-3.9-9.1-3.5-1.5-7.6.3-9.1 3.8-1.4 3.5.3 7.6 3.9 9.1zm38.3-21.4c3.5 1.5 7.7-.2 9.1-3.8 1.5-3.6-.2-7.7-3.9-9.1-3.6-1.5-7.6.3-9.1 3.8-1.3 3.6.4 7.7 3.9 9.1zm64.4-5.6c-3.6 1.5-7.8-.2-9.1-3.7-1.5-3.6.2-7.8 3.8-9.2 3.6-1.4 7.7.3 9.2 3.9 1.3 3.5-.4 7.5-3.9 9zm15.9 9.3c-3.6 1.5-7.7-.2-9.1-3.7-1.5-3.6.2-7.8 3.7-9.1 3.6-1.5 7.7.2 9.2 3.8 1.5 3.5-.3 7.5-3.8 9zm4.7 17.7c-3.6 1.5-7.8-.2-9.2-3.8-1.5-3.6.2-7.7 3.9-9.1 3.6-1.5 7.7.3 9.2 3.8 1.3 3.5-.4 7.6-3.9 9.1zM89.3 35.8c-3.6 1.5-7.8-.2-9.2-3.8-1.4-3.6.2-7.7 3.9-9.1 3.6-1.5 7.7.3 9.2 3.8 1.4 3.6-.3 7.7-3.9 9.1zM69.7 17.7l8.9 4.7V9.3l-8.9 2.8c-.2-.3-.5-.6-.9-.9L72.4 0H59.6l3.5 11.2c-.3.3-.6.5-.9.9l-8.8-2.8v13.1l8.8-4.7c.3.3.6.7.9.9l-5 15.4v.1c-.2.8-.4 1.6-.4 2.4 0 4.1 3.1 7.5 7 8.1h.2c.3 0 .7.1 1 .1.4 0 .7 0 1-.1h.2c4-.6 7.1-4.1 7.1-8.1 0-.8-.1-1.7-.4-2.4V34l-5.1-15.4c.4-.2.7-.6 1-.9zM66 92.8c16.9 0 32.8 1.1 47.1 3.2 4-16.9 8.9-26.7 14-33.5l-9.6-3.4c1 4.9 1.1 7.2 0 10.2-1.5-1.4-3-4.3-4.2-8.7L108.6 76c2.8-2 5-3.2 7.5-3.3-4.4 9.4-10 11.9-13.6 11.2-4.3-.8-6.3-4.6-5.6-7.9 1-4.7 5.7-5.9 8-.5 4.3-8.7-3-11.4-7.6-8.8 7.1-7.2 7.9-13.5 2.1-21.1-8 6.1-8.1 12.3-4.5 20.8-4.7-5.4-12.1-2.5-9.5 6.2 3.4-5.2 7.9-2 7.2 3.1-.6 4.3-6.4 7.8-13.5 7.2-10.3-.9-10.9-8-11.2-13.8 2.5-.5 7.1 1.8 11 7.3L80.2 60c-4.1 4.4-8 5.3-12.3 5.4 1.4-4.4 8-11.6 8-11.6H55.5s6.4 7.2 7.9 11.6c-4.2-.1-8-1-12.3-5.4l1.4 16.4c3.9-5.5 8.5-7.7 10.9-7.3-.3 5.8-.9 12.8-11.1 13.8-7.2.6-12.9-2.9-13.5-7.2-.7-5 3.8-8.3 7.1-3.1 2.7-8.7-4.6-11.6-9.4-6.2 3.7-8.5 3.6-14.7-4.6-20.8-5.8 7.6-5 13.9 2.2 21.1-4.7-2.6-11.9.1-7.7 8.8 2.3-5.5 7.1-4.2 8.1.5.7 3.3-1.3 7.1-5.7 7.9-3.5.7-9-1.8-13.5-11.2 2.5.1 4.7 1.3 7.5 3.3l-4.7-15.4c-1.2 4.4-2.7 7.2-4.3 8.7-1.1-3-.9-5.3 0-10.2l-9.5 3.4c5 6.9 9.9 16.7 14 33.5 14.8-2.1 30.8-3.2 47.7-3.2z"
                                               ></path></svg
                                             ><span style="padding-left: 5px;"
                                               >GOV.UK</span
                                             ></span
                                           ></a
                                         >
                                       </div>
                                     </div>
                                   </header>
                                  {message_body}
                                 </div>
                               </div>
                             </body>
                           </html>"""
    return base_template
