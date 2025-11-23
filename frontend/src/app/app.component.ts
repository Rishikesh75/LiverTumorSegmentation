import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SegmentationComponent } from './presentation/components/segmentation/segmentation.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SegmentationComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Liver Tumor Segmentation';
}
