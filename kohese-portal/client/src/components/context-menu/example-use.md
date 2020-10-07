  @ViewChildren(MatMenuTrigger)
  contextMenu: QueryList<MatMenuTrigger>;

  contextMenuPosition = { x: '0px', y: '0px' };

  onContextMenu(event: MouseEvent, contextMenuComponent: HTMLDivElement, itemProxy: ItemProxy) {
    event.preventDefault();
    contextMenuComponent.style.left = event.clientX + 'px';
    contextMenuComponent.style.top = event.clientY + 'px';
    this.contextMenu.toArray()[0].menuData= { itemProxy: itemProxy };
    this.contextMenu.toArray()[0].menu.focusFirstItem('mouse');
    this.contextMenu.toArray()[0].openMenu();
  }

  public getMenuItems(itemProxy: ItemProxy): MenuItem[] {
    return [{
      action: 'Display Item',
      icon: 'fa fa-clone',
      execute: () => {
        this._dialogService.openComponentDialog(DetailsComponent, {
          data: { itemProxy: itemProxy }
        }).updateSize('90%', '90%');
      }
    }, {
      action: 'Navigate in Explorer',
      icon: 'fa fa-arrow-right',
      execute: () => {
        console.log('Executed: Navigate in Explorer');
        this._navigationService.navigate('Explore', { id: itemProxy.item.id });
      },
    }, {
      action: 'Open in New Tab',
      icon: 'fa fa-external-link',
      execute: () => {
        this._navigationService.addTab('Explore', { id: itemProxy.item.id });
      }
    }]
  }
