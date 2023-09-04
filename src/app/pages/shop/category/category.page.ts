import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { map, take } from 'rxjs/operators';
import { category } from 'src/app/classes/category';
import { DbService } from 'src/app/services/db.service';

@Component({
  selector: 'app-category',
  templateUrl: './category.page.html',
  styleUrls: ['./category.page.scss'],
})
export class CategoryPage implements OnInit {
  panelOpenState = false;

  topCategory;
  constructor(private navc: NavController, private db: DbService) {}

  async ngOnInit() {
    this.topCategory = await this.getCategory();
    console.log('this.topCategory', this.topCategory);
  }

  //카테고리 가져오기
  getCategory(): Promise<void> {
    return this.db
      .collection$('category', (ref) => ref.where('deleteSwitch', '==', false))
      .pipe(
        map((categories: any) => {
          const topCategory = categories.filter((ele) => ele.type == 'top');
          topCategory.map((ele) => {
            ele.subCategory = categories.filter(
              (item) =>
                item.type == 'middle' && item.topCategoryId == ele.topCategoryId
            );
            return ele;
          });

          return topCategory;
        })
      )
      .pipe(take(1))
      .toPromise();
  }

  //카테고리에 적합한 상품리스트로 이동
  goProductlist(item) {
    this.navc.navigateForward(['/shop/product-list'], {
      queryParams: {
        topCategoryId: item.topCategoryId,
        subCategoryId: item.id,
      },
    });
  }
}
