import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Subject, Subscription, debounceTime } from 'rxjs';
import { MarkdownFile } from '../../models/markdown-file.model';
import { MarkdownService } from '../../services/markdown.service';
import { MarkdownFormatEvent } from '../toolbar/toolbar.component';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit, OnDestroy {
  @Output() contentChanged = new EventEmitter<string>();
  @ViewChild('editor') editorElement!: ElementRef;
  
  currentFile: MarkdownFile = new MarkdownFile();
  private contentSubject = new Subject<string>();
  private subscriptions: Subscription[] = [];
  private autoSaveTimer: any;
  
  constructor(private markdownService: MarkdownService) { }

  ngOnInit(): void {
    // Subscribe to content changes with debounce for live preview
    this.subscriptions.push(
      this.contentSubject
        .pipe(debounceTime(300))
        .subscribe(content => {
          this.contentChanged.emit(content);
        })
    );
    
    // Subscribe to current file changes
    this.subscriptions.push(
      this.markdownService.getCurrentFile().subscribe(file => {
        this.currentFile = {...file};
        // Emit the initial content
        this.contentChanged.emit(this.currentFile.content);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }
  }

  onContentChange(): void {
    this.contentSubject.next(this.currentFile.content);
    this.setupAutoSave();
  }

  setupAutoSave(): void {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }
    
    this.autoSaveTimer = setTimeout(() => {
      this.saveFile();
    }, 2000); // Auto save after 2 seconds of inactivity
  }

  async saveFile(): Promise<void> {
    try {
      console.log('Saving file:', this.currentFile);
      
      // Check if we have content or name
      if (!this.currentFile.name.trim()) {
        this.currentFile.name = 'Untitled';
      }
      
      if (this.currentFile.id) {
        console.log('Updating existing file with ID:', this.currentFile.id);
        await this.markdownService.updateFile(this.currentFile);
        console.log('File updated successfully');
      } else {
        console.log('Creating new file');
        
        try {
          // Create a proper file object
          const fileToSave = new MarkdownFile(
            undefined,
            this.currentFile.name,
            this.currentFile.content,
            new Date(),
            new Date()
          );
          
          // Save to database
          const id = await this.markdownService.createFile(fileToSave);
          console.log('File created with ID:', id);
          
          if (id) {
            // Create a new object with the ID to avoid reference issues
            const savedFile = new MarkdownFile(
              id,
              fileToSave.name,
              fileToSave.content,
              fileToSave.createdAt,
              fileToSave.updatedAt
            );
            
            // Update the current file reference
            this.currentFile = savedFile;
            this.markdownService.setCurrentFile(savedFile);
            
            // Show feedback to the user
            console.log('File saved successfully:', savedFile);
            
            // Instead of an alert, we could implement a non-blocking notification here
            // For now, we'll use console log for feedback
          }
        } catch (error) {
          console.error('Error saving file:', error);
          alert('Failed to save file. Please try again.');
        }
      }
      
      // Show success notification
      this.showToast('File saved successfully!');
    } catch (error) {
      console.error('Error saving file:', error);
      alert('Failed to save your file. Please try again.');
    }
  }
  
  // Simple toast notification
  private showToast(message: string): void {
    const toast = document.createElement('div');
    toast.className = 'position-fixed bottom-0 end-0 p-3';
    toast.style.zIndex = '5';
    
    toast.innerHTML = `
      <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header">
          <strong class="me-auto">Notification</strong>
          <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close" onclick="this.parentElement.parentElement.remove()"></button>
        </div>
        <div class="toast-body">
          ${message}
        </div>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  async saveFileName(): Promise<void> {
    if (!this.currentFile.name.trim()) {
      this.currentFile.name = 'Untitled';
    }
    
    await this.saveFile();
  }

  insertFormat(event: MarkdownFormatEvent): void {
    const textArea = this.editorElement.nativeElement;
    const start = textArea.selectionStart;
    const end = textArea.selectionEnd;
    const selectedText = this.currentFile.content.substring(start, end);
    const beforeText = this.currentFile.content.substring(0, start);
    const afterText = this.currentFile.content.substring(end);
    
    this.currentFile.content = beforeText + event.prefix + selectedText + event.suffix + afterText;
    
    // Set the cursor position after the inserted text
    setTimeout(() => {
      textArea.focus();
      const newCursorPos = start + event.prefix.length + selectedText.length + event.suffix.length;
      textArea.selectionStart = textArea.selectionEnd = newCursorPos;
    }, 0);
    
    this.onContentChange();
  }
}
