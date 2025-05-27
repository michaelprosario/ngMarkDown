import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { MarkdownFile } from '../../models/markdown-file.model';
import { MarkdownService } from '../../services/markdown.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  @Output() fileImported = new EventEmitter<MarkdownFile>();
  
  constructor(private markdownService: MarkdownService) { }

  ngOnInit(): void {
  }

  onNewFile(): void {
    const newFile = new MarkdownFile();
    this.markdownService.setCurrentFile(newFile);
  }

  onImport(): void {
    this.fileInput.nativeElement.click();
  }

  async handleFileInput(event: any): Promise<void> {
    const file = event.target.files[0];
    if (file) {
      try {
        const content = await file.text();
        const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove file extension
        const markdownFile = new MarkdownFile(undefined, fileName, content);
        
        // Save the imported file to IndexedDB
        const id = await this.markdownService.createFile(markdownFile);
        markdownFile.id = id;
        
        // Set as current file
        this.markdownService.setCurrentFile(markdownFile);
        this.fileImported.emit(markdownFile);
      } catch (error) {
        console.error('Error importing file:', error);
        alert('Failed to import file. Please try again.');
      }
      
      // Reset file input
      this.fileInput.nativeElement.value = '';
    }
  }
}
