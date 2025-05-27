import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { MarkdownFile } from '../../models/markdown-file.model';
import { MarkdownService } from '../../services/markdown.service';

@Component({
  selector: 'app-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.scss']
})
export class FileListComponent implements OnInit, OnDestroy {
  files: MarkdownFile[] = [];
  currentFile: MarkdownFile | null = null;
  isRenaming = false;
  renamingFileId: number | undefined;
  newFileName: string = '';
  private currentFileSub: Subscription | null = null;
  
  @ViewChild('renameInput') renameInput!: ElementRef;

  constructor(private markdownService: MarkdownService) { }

  ngOnInit(): void {
    this.loadFiles();
    this.currentFileSub = this.markdownService.getCurrentFile().subscribe(file => {
      this.currentFile = file;
    });
  }

  ngOnDestroy(): void {
    if (this.currentFileSub) {
      this.currentFileSub.unsubscribe();
    }
  }

  async loadFiles(): Promise<void> {
    try {
      this.files = await this.markdownService.getFiles();
      // Sort by updated date, newest first
      this.files.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    } catch (error) {
      console.error('Error loading files:', error);
      alert('Failed to load your files. Please try refreshing the page.');
    }
  }

  async loadFile(file: MarkdownFile): Promise<void> {
    try {
      // If we're currently renaming, don't load the file
      if (this.isRenaming) return;
      
      const freshFile = await this.markdownService.getFileById(file.id!);
      if (freshFile) {
        this.markdownService.setCurrentFile(freshFile);
      }
    } catch (error) {
      console.error('Error loading file:', error);
      alert('Failed to load the selected file.');
    }
  }

  async deleteFile(file: MarkdownFile, event: Event): Promise<void> {
    event.stopPropagation();
    if (!confirm(`Are you sure you want to delete "${file.name}"?`)) return;
    
    try {
      await this.markdownService.deleteFile(file.id!);
      await this.loadFiles();
      
      // If the deleted file was the current one, create a new file
      if (this.currentFile && this.currentFile.id === file.id) {
        this.markdownService.setCurrentFile(new MarkdownFile());
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete the file.');
    }
  }

  startRename(file: MarkdownFile, event: Event): void {
    event.stopPropagation();
    this.isRenaming = true;
    this.renamingFileId = file.id;
    this.newFileName = file.name;
    
    setTimeout(() => {
      this.renameInput.nativeElement.focus();
    }, 0);
  }

  async completeRename(): Promise<void> {
    if (!this.newFileName.trim()) {
      this.newFileName = 'Untitled';
    }
    
    try {
      await this.markdownService.renameFile(this.renamingFileId!, this.newFileName);
      await this.loadFiles();
      
      // If the renamed file is the current one, update its name in the current file
      if (this.currentFile && this.currentFile.id === this.renamingFileId) {
        const updatedFile = { ...this.currentFile };
        updatedFile.name = this.newFileName;
        this.markdownService.setCurrentFile(updatedFile);
      }
    } catch (error) {
      console.error('Error renaming file:', error);
      alert('Failed to rename the file.');
    }
    
    this.cancelRename();
  }

  cancelRename(): void {
    this.isRenaming = false;
    this.renamingFileId = undefined;
    this.newFileName = '';
  }

  async exportFile(file: MarkdownFile, event: Event): Promise<void> {
    event.stopPropagation();
    try {
      const url = await this.markdownService.exportFile(file.id!);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting file:', error);
      alert('Failed to export the file.');
    }
  }
}
