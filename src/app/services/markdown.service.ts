import Dexie from 'dexie';
import { Injectable } from '@angular/core';
import { MarkdownFile } from '../models/markdown-file.model';
import { BehaviorSubject, Observable } from 'rxjs';

export class MarkdownDatabase extends Dexie {
  markdownFiles!: Dexie.Table<MarkdownFile, number>;

  constructor() {
    super('MarkdownDatabase');
    this.version(1).stores({
      markdownFiles: '++id, name, content, createdAt, updatedAt'
    });
  }
}

@Injectable({
  providedIn: 'root'
})
export class MarkdownService {
  private db: MarkdownDatabase;
  private currentFile = new BehaviorSubject<MarkdownFile>(new MarkdownFile());
  
  constructor() {
    this.db = new MarkdownDatabase();
  }

  getCurrentFile(): Observable<MarkdownFile> {
    return this.currentFile.asObservable();
  }

  setCurrentFile(file: MarkdownFile): void {
    this.currentFile.next(file);
  }

  async getFiles(): Promise<MarkdownFile[]> {
    return await this.db.markdownFiles.toArray();
  }

  async getFileById(id: number): Promise<MarkdownFile | undefined> {
    return await this.db.markdownFiles.get(id);
  }

  async createFile(file: MarkdownFile): Promise<number> {
    return await this.db.markdownFiles.add(file);
  }

  async updateFile(file: MarkdownFile): Promise<number | undefined> {
    if (!file.id) {
      throw new Error('File ID is required for update');
    }
    
    file.updatedAt = new Date();
    return await this.db.markdownFiles.update(file.id, file);
  }

  async deleteFile(id: number): Promise<void> {
    await this.db.markdownFiles.delete(id);
  }

  async renameFile(id: number, newName: string): Promise<number | undefined> {
    const file = await this.getFileById(id);
    if (file) {
      file.name = newName;
      file.updatedAt = new Date();
      return await this.updateFile(file);
    }
    return undefined;
  }

  async exportFile(id: number): Promise<string> {
    const file = await this.getFileById(id);
    if (!file) {
      throw new Error('File not found');
    }
    
    const blob = new Blob([file.content], { type: 'text/markdown' });
    return URL.createObjectURL(blob);
  }
}
