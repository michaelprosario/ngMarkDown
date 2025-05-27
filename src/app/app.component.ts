import { Component, OnInit } from '@angular/core';
import { MarkdownFile } from './models/markdown-file.model';
import { MarkdownService } from './services/markdown.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'ngMarkDown';
  markdownContent = '';

  constructor(private markdownService: MarkdownService) {}

  ngOnInit(): void {
    // Initialize with a new file after a short delay to ensure database is ready
    setTimeout(() => {
      this.markdownService.setCurrentFile(new MarkdownFile());
      console.log('App initialized with a new file');
    }, 500);
  }

  updatePreview(content: string): void {
    this.markdownContent = content;
  }

  handleFileImported(file: MarkdownFile): void {
    // Refresh the file list when a file is imported
    // This will be handled by the file-list component's subscription to the current file
  }
}
