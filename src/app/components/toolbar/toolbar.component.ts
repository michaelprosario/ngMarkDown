import { Component, EventEmitter, OnInit, Output } from '@angular/core';

export interface MarkdownFormatEvent {
  prefix: string;
  suffix: string;
}

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {
  @Output() format = new EventEmitter<MarkdownFormatEvent>();

  constructor() { }

  ngOnInit(): void {
  }

  insertMarkdown(prefix: string, suffix: string): void {
    this.format.emit({ prefix, suffix });
  }
}
