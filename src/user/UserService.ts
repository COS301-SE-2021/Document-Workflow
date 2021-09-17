import { injectable } from "tsyringe";
import UserRepository from "./UserRepository";
import { PrivilegeLevel, UserDoc, UserProps } from "./User";
import nodemailer from "nodemailer";
import jwt, { Jwt } from "jsonwebtoken";
import { AuthenticationError, RequestError, ServerError } from "../error/Error";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { isStrongPassword, isEmail } from "validator";
import { logger } from "../LoggingConfig";
import Database from "../Database";
import { ObjectId } from "mongoose";

@injectable()
export default class UserService {
  constructor(private userRepository: UserRepository) {}
  async authenticateUser(password, usr: UserProps): Promise<String> {
    const result = await bcrypt.compare(password, await usr.password);
    if (result) {
      return this.generateToken(usr.email, usr._id, usr.privilegeLevel);
      /*const user: UserDoc = await this.userRepository.findUser(usr.email);
            user.tokens.push(token);
            await this.userRepository.updateUser(user);*/
    } else {
      throw new AuthenticationError("Password or Email is incorrect");
    }
  }

  async getHashedPassword(password: string) {
    return await bcrypt
      .hash(password, parseInt(process.env.SALT_ROUNDS))
      .then(function (hash) {
        return hash;
      })
      .catch((err) => {
        throw new Error(err);
      });
  }

  async generateToken(email, id, privilege): Promise<String> {
    return jwt.sign(
      { id: id, email: email, privilege: privilege },
      process.env.SECRET,
      { expiresIn: "1h" }
    );
  }

  //TODO: check that its safe to save a user the way we are saving them here. We arent creating an entirely new
  //User since we do pass through a valid id, but should probably use an updateOne function in the
  //User repository to be safe.
  async updateUserWorkflows(user) {
    await this.userRepository.saveUser(user);
  }

  async getUser(request): Promise<UserProps> {
    if (request === undefined) {
      throw new RequestError("Search criteria required");
    }
    try {
      return await this.userRepository.findUser(request.params);
    } catch (err) {
      console.error(err);
      throw new RequestError("Could not get user");
    }
  }

  async getUserById(id): Promise<UserProps> {
    if (id === undefined) {
      throw new Error("Search criteria required");
    }
    try {
      return await this.userRepository.findUser({ _id: id });
    } catch (err) {
      console.error(err);
      throw new RequestError("Could not get user");
    }
  }

  async getUserByEmail(email): Promise<UserProps> {
    if (email === undefined) {
      throw new Error("Search criteria required");
    }
    try {
      return await this.userRepository.findUser({ email: email });
    } catch (err) {
      console.error(err);
      throw new RequestError("Could not get user");
    }
  }

  async getAllUsers(): Promise<UserProps[]> {
    try {
      return await this.userRepository.findUsers({});
    } catch (err) {
      console.error(err);
      throw new RequestError("Could not get users");
    }
  }

  async registerUser(req): Promise<UserProps> {
    if (req.body.length === 0 || !req.body || !req.files.signature.data) {
      throw new RequestError("Missing required information to register user");
    }

    if (!isEmail(req.body.email)) {
      throw new RequestError("The given email address is invalid.");
    }

    const checkForUser = await this.getUserByEmail(req.body.email);
    if (checkForUser) {
      throw new RequestError(
        "The given email address already has a Document Workflow Account"
      );
    }

    if (req.body.password !== req.body.confirmPassword) {
      throw new RequestError("The two passwords do not match.");
    }

    if (!isStrongPassword(req.body.password)) {
      throw new RequestError(
        "Password is not strong enough. Ensure that it is at least 8 characters long with one uppercase character, lowercase character, number and special character"
      );
    }

    const usr: UserProps = req.body;
    usr.signature = req.files.signature.data;
    usr.validateCode = crypto.randomBytes(64).toString("hex");
    usr.password = await this.getHashedPassword(usr.password);
    usr.ownedWorkflows = [];
    usr.workflows = [];
    usr.workflowTemplates = [];
    const tempValidateCode = usr.validateCode;
    //const user: UserProps = await this.userRepository.postUser(usr);
    //const token: Token = { token: await this.generateToken(usr.email, usr._id), __v: 0};
    //usr.tokens = [token];
    const user: UserProps = await this.userRepository.saveUser(usr);
    //const response = await this.userRepository.putUser(usr);
    if (user) {
      //logger.info(usr); It seems as though the usr object gets changed after it is saved to the database
      logger.info(req.body.email + " " + tempValidateCode);
      await this.sendVerificationEmail(req.body.email, tempValidateCode); //,
      return user;
    }
  }

  async verifyUser(req): Promise<any> {
    const redirect_url = process.env.REDIRECT_URL;
    if (!req.query.email || !req.query.verificationCode) {
      throw new RequestError("Missing required properties");
    }
    const query = req.query;

    const user = await this.userRepository.findUser({ email: query.email });
    if (user && user.validateCode === query.verificationCode) {
      user.validated = true;
      await this.userRepository.updateUser(user);
      return (
        '<html lang="en">Successfully verified. Click<a href= ' +
        redirect_url +
        "> here</a> to return to login</html>"
      );
    } else {
      throw new AuthenticationError("Could not Validate User Account");
    }
  }

  async sendVerificationEmail(emailAddress, code): Promise<void> {
    logger.info("Sending an email to the new email address");
    let url =
      process.env.BASE_URL +
      "/users/verify?verificationCode=" +
      code +
      "&email=" +
      emailAddress;
    let transporter = nodemailer.createTransport({
      service: process.env.NODEMAILER_SERVICE,
      host: process.env.NODEMAILER_SMTP,
      port: process.env.NODEMAILER_PORT,
      secure: true,
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: { rejectUnauthorized: false },
    });

    let mailOptions = {
      from: process.env.EMAIL_ADDRESS,
      to: emailAddress,
      subject: "DocumentWorkflow Verification Code",
      html:
        "<html lang='en'><p>Hello new DocumentWorkflow User, use this link to activate your account! </p>" +
        "<a href='" +
        url +
        "'>Click here</a></html>",
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        return false;
      } else {
        console.log("Email sent: " + info.response);
        return true;
      }
    });
  }

  async loginUser(email, password): Promise<String> {
    const user = await this.userRepository.findUser({ email: email });
    if (!user) {
      throw new RequestError("User does not exist.");
    }

    if (user.validated) {
      try {
        return await this.authenticateUser(password, user);
      } catch (err) {
        throw new AuthenticationError(
          "The entered email or password was incorrect"
        );
      }
    } else {
      throw new AuthenticationError(
        "Please check your emails and validate your account."
      );
    }
  }

  async logoutUser(token: Jwt): Promise<Boolean> {
    console.log("Logging out a user");
    try {
      return true;
    } catch (err) {
      console.error(err);
      throw new RequestError("Could not log out user");
    }
  }

  async deleteUser(req): Promise<UserProps> {
    if (!req.params.id) {
      throw new RequestError("Missing Parameter");
    }
    if (!(await this.userRepository.findUser(req.params.id))) {
      throw new RequestError("User does not exist");
    }
    try {
      return await this.userRepository.deleteUser(req.params.id);
    } catch (err) {
      console.error(err);
      throw new RequestError("Could not remove user");
    }
  }

  encryptSignature(buffer) {
    let cipher, result, iv;

    iv = crypto.randomBytes(16);
    cipher = crypto.createCipheriv(
      process.env.ALGORITHM,
      process.env.SECRET,
      iv
    );
    result = Buffer.concat([iv, cipher.update(buffer), cipher.final()]);

    return result;
  }

  async getUserDetails(req) {
    try {
      let user = await this.userRepository.findUser({ email: req.user.email });
      const data = {
        name: user.name,
        surname: user.surname,
        initials: user.initials,
        email: user.email,
        signature: user.signature.toString(),
        //ownedWorkflows: user.ownedWorkflows,
        //workflows: user.workflows
      };
      return { status: "success", data: data, message: "" };
    } catch (err) {
      console.log(err);
      throw "Could not fetch user details";
    }
  }

  decryptSignature(buffer) {
    let decipher, result, iv;

    iv = buffer.slice(0, 16);

    buffer = buffer.slice(16);
    decipher = crypto.createDecipheriv(
      process.env.ALGORITHM,
      process.env.SECRET,
      iv
    );
    result = Buffer.concat([decipher.update(buffer), decipher.final()]);

    return result;
  }

  //too generic, dangerous for elevating user privilege
  async updateUser(req): Promise<UserProps> {
    if (!req.body || !req.params.id) {
      throw new RequestError("Missing Parameters");
    }
    if (!(await this.userRepository.findUser({ _id: req.params.id }))) {
      throw new RequestError("User does not exist");
    }
    try {
      return await this.userRepository.updateUser(req.body);
    } catch (err) {
      console.error(err);
      throw new RequestError("Could not update User");
    }
  }

  /*async verifyEmailExistence(email, requestingUserId) {
        return Promise.resolve(undefined);
    }*/

  private static removeFromArray(array: Array<any>, value): Boolean {
    const indexOfRemovedValue = array.indexOf(value);
    if (indexOfRemovedValue != -1) {
      array.splice(indexOfRemovedValue, 1);
      return true;
    }
    return false;
  }

  private static addToArrayIfNotPresent(array: Array<any>, value): Boolean {
    if (array.indexOf(value) != -1) {
      return false;
    }
    array.push(value);
    return true;
  }

  async blockUser(contactEmail: string, user): Promise<ObjectId> {
    //check if email of contact exists:
    const contact: UserDoc = await this.userRepository.findUser({
      email: contactEmail,
    });
    if (contact) {
      const currentUser: UserDoc = await this.userRepository.findUser({
        _id: user._id,
      });
      //check if they're already a contact
      if (currentUser.blockedList.indexOf(contactEmail) != -1) {
        throw new RequestError("This contact is already blocked by this user");
      }
      currentUser.blockedList.push(contactEmail);
      const removed = UserService.removeFromArray(
        currentUser.contacts,
        contactEmail
      );
      await this.userRepository.updateUser(currentUser);
      return contact._id;
    } else {
      throw new RequestError("Contact does not exist");
    }
  }

  async unblockUser(contactEmail: string, user): Promise<ObjectId> {
    //check if email of contact exists:
    const contact: UserDoc = await this.userRepository.findUser({
      email: contactEmail,
    });
    if (contact) {
      const currentUser: UserDoc = await this.userRepository.findUser({
        _id: user._id,
      });
      const indexOfRemovedEmail = currentUser.blockedList.indexOf(contactEmail);
      if (indexOfRemovedEmail != -1) {
        currentUser.blockedList.splice(indexOfRemovedEmail, 1);
        const added = UserService.addToArrayIfNotPresent(
          currentUser.contacts,
          contactEmail
        );
        if (added) {
          await this.userRepository.updateUser(currentUser);
        } else {
          throw new RequestError("Failed to add user back");
        }
      } else {
        throw new RequestError("This person is not blocked");
      }
      return contact._id;
    } else {
      throw new RequestError("Contact does not exist");
    }
  }

  async acceptContactRequest(contactEmail: string, user): Promise<ObjectId> {
    console.log(contactEmail);
    console.log(user);
    //get User
    const usr: UserDoc = await this.userRepository.findUser({
      email: user.email,
    });
    //check if contact exists:
    const contact: UserDoc = await this.userRepository.findUser({
      email: contactEmail,
    });

    if (!contact) throw new RequestError("contact doesn't exist");
    //find contact in requests array:
    const removed = UserService.removeFromArray(
      usr.contactRequests,
      contactEmail
    );
    const removed1 = UserService.removeFromArray(
      contact.contactRequests,
      user.email
    );
    if (removed) {
      //add to contacts array:
      const added = UserService.addToArrayIfNotPresent(
        usr.contacts,
        contactEmail
      );
      const addedToContact = UserService.addToArrayIfNotPresent(
        contact.contacts,
        user.email
      );
      console.log(added + " " + addedToContact);
      if (added && addedToContact) {
        await this.userRepository.updateUser(usr);
        await this.userRepository.updateUser(contact);
        return usr._id;
      } else {
        throw new ServerError("Couldn't accept contact request");
      }
    } else {
      throw new ServerError("Couldn't accept contact request");
    }
  }

  async sendContactRequest(recipientEmail, user): Promise<ObjectId> {
    //check if email of contact exists:
    //add MY email to Contact's contact requests
    const recipient: UserDoc = await this.userRepository.findUser({
      email: recipientEmail,
    });
    if (recipient) {
      const index = recipient.blockedList.indexOf(user.email);
      if (index != -1) {
        throw new RequestError("User is on recipient's blocked list");
      }
      if (
        !UserService.addToArrayIfNotPresent(
          recipient.contactRequests,
          user.email
        )
      )
        throw new RequestError("Contact request already exists");
      await this.userRepository.updateUser(recipient);
      return recipient._id;
    } else {
      throw new RequestError("Recipient does not exist");
    }
  }

  async rejectContactRequest(contactEmail: string, user): Promise<ObjectId> {
    //check if email of contact exists:
    const contact: UserDoc = await this.userRepository.findUser({
      email: contactEmail,
    });
    if (contact) {
      const currentUser: UserDoc = await this.userRepository.findUser({
        _id: user._id,
      });
      const indexOfRemovedEmail =
        currentUser.contactRequests.indexOf(contactEmail);
      if (indexOfRemovedEmail != -1) {
        currentUser.contactRequests.splice(indexOfRemovedEmail, 1);
        await this.userRepository.updateUser(currentUser);
      } else {
        throw new RequestError("Contact request does not exist");
      }
      return contact._id;
    } else {
      throw new RequestError("Contact does not exist");
    }
  }

  async deleteContact(contactEmail: string, user): Promise<ObjectId> {
    //check if email of contact exists:
    const contact: UserDoc = await this.userRepository.findUser({
      email: contactEmail,
    });
    if (contact) {
      const currentUser: UserDoc = await this.userRepository.findUser({
        _id: user._id,
      });

      const removed = UserService.removeFromArray(
        currentUser.contacts,
        user.email
      );
      const removed1 = UserService.removeFromArray(
        contact.contactRequests,
        contactEmail
      );
      if(removed && removed1){
        await this.userRepository.updateUser(currentUser);
        await this.userRepository.updateUser(contact);
      } else {
        throw new RequestError("This person is not a contact");
      }
      return contact._id;
    } else {
      throw new RequestError("Contact does not exist");
    }
  }

  async getContacts(email: string) {
    const user: UserDoc = await this.userRepository.findUser({ email: email });
    if (user) {
      return user.contacts;
    } else {
      throw new ServerError("User not found");
    }
  }

  async getBlockedContacts(email: string) {
    const user: UserDoc = await this.userRepository.findUser({ email: email });
    if (user) {
      return user.blockedList;
    } else {
      throw new ServerError("User not found");
    }
  }

  async getContactRequests(email: string) {
    const user: UserDoc = await this.userRepository.findUser({ email: email });
    if (user) {
      return user.contactRequests;
    } else {
      throw new ServerError("User not found");
    }
  }

  async addContact(contactEmail: string, user): Promise<ObjectId> {
    //check if email of contact exists:
    if (user.privilegeLevel != PrivilegeLevel.ADMIN) {
      throw new AuthenticationError("Unauthorized");
    }
    const contact: UserDoc = await this.userRepository.findUser({
      email: contactEmail,
    });
    if (contact) {
      const currentUser: UserDoc = await this.userRepository.findUser({
        _id: user._id,
      });
      //check if they're already a contact
      if (currentUser.contacts.indexOf(contactEmail) != -1) {
        throw new RequestError(
          "This contact is already a contact of this user"
        );
      }
      currentUser.contacts.push(contactEmail);
      await this.userRepository.updateUser(currentUser);
      return contact._id;
    } else {
      throw new RequestError("Contact does not exist");
    }
  }

  async getWorkflowTemplatesIds(user) {
    const usr = await this.getUserById(user._id);
    return {
      status: "success",
      data: { templateIds: usr.workflowTemplates },
      message: "",
    };
  }

  async generatePasswordReset(userEmail) {
    const usr = await this.getUserByEmail(userEmail);
    logger.info("Resetting email of userwith email address: " + userEmail);

    if (usr === null) {
      throw new RequestError("No user with that email address was found.");
    }
    usr.antiCSRFToken = crypto.randomBytes(64).toString("hex");
    usr.csrfTokenTime = Date.now();
    await this.userRepository.saveUser(usr);
    const res = await this.sendResetRequestEmail(userEmail, usr.antiCSRFToken);
    logger.info(res); //TODO: check this for errors thrown
    return { status: "success", data: {}, message: "" };
  }

  async sendResetRequestEmail(emailAddress, antiCSRFCode) {
    logger.info("Sending an email to the new email address");
    let transporter = nodemailer.createTransport({
      service: process.env.NODEMAILER_SERVICE,
      host: process.env.NODEMAILER_SMTP,
      port: process.env.NODEMAILER_PORT,
      secure: true,
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: { rejectUnauthorized: false },
    });

    let mailOptions = {
      from: process.env.EMAIL_ADDRESS,
      to: emailAddress,
      subject: "DocumentWorkflow Password Reset Code",
      html:
        "<html lang='en'><p>Hello new DocumentWorkflow User, use this code to reset your password: " +
        antiCSRFCode +
        "</p></html>",
    };

    const emailResponse = transporter.sendMail(mailOptions);
    return emailResponse;
  }

  async resetPassword(email, password, token) {
    const usr = await this.getUserByEmail(email);
    //This check is here to ensure that hackers cant use the default value of an antiSCRF token to
    //reset a user's account
    if (usr.antiCSRFToken === "") {
      throw new RequestError(
        "Something is wrong with the token, please generate a new request"
      );
    }

    if (usr.antiCSRFToken !== token) {
      throw new RequestError("The password reset token is incorrect");
    }

    if (
      Date.now() - usr.csrfTokenTime >
      parseInt(process.env.CSRF_TOKEN_TIMEOUT_MILLISECONDS)
    ) {
      throw new RequestError(
        "The password reset token has expired, please create a new request"
      );
    }

    if (!isStrongPassword(password)) {
      throw new RequestError("The new password is not strong enough");
    }

    usr.password = await this.getHashedPassword(password);
    await this.userRepository.saveUser(usr);
    return { status: "success", data: {}, message: "" };
  }
}
