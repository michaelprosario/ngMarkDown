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
  private initialized = false;
  
  constructor() {
    this.db = new MarkdownDatabase();
    this.initDatabase();
  }
    private async initDatabase(): Promise<void> {
    try {
      // Check if the database is accessible by performing a simple operation
      await this.db.markdownFiles.count();
      this.initialized = true;
      console.log('IndexedDB initialized successfully');
      
      // Create a test file if no files exist (first run)
      const fileCount = await this.db.markdownFiles.count();
      if (fileCount === 0) {
        const welcomeFile = new MarkdownFile(
          undefined,
          'Welcome',
          '# Welcome to Markdown Editor\n\nThis is a simple markdown editor that allows you to create and edit markdown files.\n\n## Features\n\n- Create new markdown files\n- Edit existing files\n- Preview markdown in real-time\n- Save files to IndexedDB\n- Export files\n\nTry creating your own file using the "New File" button in the header!',
          new Date(),
          new Date()
        );
        await this.createFile(welcomeFile);
      }
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error);
      alert('Failed to initialize the database. Some features may not work.');
    }
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
  }  async createFile(file: MarkdownFile): Promise<number> {
    // Make sure database is initialized
    if (!this.initialized) {
      await this.initDatabase();
    }
    
    // Create a proper object to ensure all fields are set correctly
    const newFile = {
      name: file.name || 'Untitled',
      content: file.content || '',
      createdAt: file.createdAt || new Date(),
      updatedAt: new Date()
    };
    
    try {
      // Add explicit type checking and verification
      console.log('Creating new file:', newFile);
      const id = await this.db.markdownFiles.add(newFile);
      
      console.log('File created with ID:', id);
      
      // Verify file was created
      const createdFile = await this.db.markdownFiles.get(id);
      if (!createdFile) {
        console.error('Failed to verify file creation');
      } else {
        console.log('File verified:', createdFile);
      }
      
      return id;
    } catch (error) {
      console.error('Error creating file:', error);
      alert('Failed to save file. Please try again.');
      throw error;
    }
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
