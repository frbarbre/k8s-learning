import { Request, Response } from "express";
import { Contact } from "../models/index.js";

export async function getAllContacts(req: Request, res: Response) {
  try {
    const contacts = await Contact.find();
    res.json(contacts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
}

export async function getContactById(req: Request, res: Response) {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      res.status(404).json({ error: "Contact not found" });
      return;
    }
    res.json(contact);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch contact" });
  }
}

export async function createContact(req: Request, res: Response) {
  try {
    const { avatar, first, last, twitter } = req.body;
    const contact = await Contact.create({ avatar, first, last, twitter });
    res.status(201).json(contact);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create contact" });
  }
}

export async function updateContact(req: Request, res: Response) {
  try {
    const { avatar, first, last, twitter } = req.body;
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { avatar, first, last, twitter },
      { new: true }
    );
    if (!contact) {
      res.status(404).json({ error: "Contact not found" });
      return;
    }
    res.json(contact);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update contact" });
  }
}

export async function deleteContact(req: Request, res: Response) {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      res.status(404).json({ error: "Contact not found" });
      return;
    }
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete contact" });
  }
}

export async function searchContacts(req: Request, res: Response) {
  const { q } = req.query;
  try {
    const contacts = await Contact.find({
      $or: [
        { first: { $regex: q as string, $options: "i" } },
        { last: { $regex: q as string, $options: "i" } },
        { twitter: { $regex: q as string, $options: "i" } },
      ],
    });
    res.json(contacts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to search contacts" });
  }
}

export async function toggleFavorite(req: Request, res: Response) {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      res.status(404).json({ error: "Contact not found" });
      return;
    }

    const updatedContact = await Contact.findByIdAndUpdate(
      req.params.id,
      { favorite: !contact.favorite },
      { new: true }
    );
    res.json(updatedContact);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to toggle favorite" });
  }
}
