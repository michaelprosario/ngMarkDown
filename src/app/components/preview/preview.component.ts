import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss']
})
export class PreviewComponent implements OnInit {
  @Input() set content(value: string) {
    if (value) {
      this.renderMarkdown(value);
    } else {
      this.renderedContent = '';
    }
  }
  
  renderedContent: SafeHtml = '';

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
  }

  renderMarkdown(content: string): void {
    try {
      const html = marked(content);
      this.renderedContent = this.sanitizer.bypassSecurityTrustHtml(html);
    } catch (error) {
      console.error('Error rendering markdown:', error);
      this.renderedContent = 'Error rendering markdown preview.';
    }
  }
}
