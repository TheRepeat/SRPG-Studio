
/*--------------------------------------------------------------------------
  
 Script to place a repair shop

■ Overview
[For location events]
If you select a store's location event and set {Durability: 0} in the custom parameter from the advanced settings,
the store will be a repair shop.

[For Battle Preparations]
If you set {Durability: n} in the map's custom parameters, the nth shop registered in the shop item 
will be the repair shop. (TL note: capitalization of Durability matters!!)
(Specify n = 0 for the top store and n = 1 for the second store from the top)

Give the repair shop at least one item to sell, as otherwise SRPG Studio won't register it as a store.
	* Don't give the item a limited amount of stock, or this plugin may not function correctly.

	======================================================================
						 ***Notes***
	----------------------------------------------------------------------
	Do not check "Display shop items at the top of the preparation screen" in Data settings → Config → User extension.
	If you check it, the repair shop will not work.
	TL note - Not sure which config option this is referring to.
	======================================================================

[For the Base]
If you set {Durability: 0} in the custom parameter of the store created / registered in the base shop, 
the store will become a repair shop.
If "Display shops in list format during game" is checked (TL note - is this an old version thing?), 
you don't have to give the shop any items to sell. 
(When using the list format, all stores that meet the conditions (even if the item for sale is 0) are valid.)

Otherwise, give the repair shop at least one item to sell, as SRPG Studio won't register it as a store without it.
	* Don't give the item a limited amount of stock, or this plugin may not function correctly.

  Customization at the base
		1. I want to be able to repair the belongings of the unit at the base
			→ Set isDurabilityUnitItemInRest = true.
			If set to true, the belongings of your own army unit that is alive and companion will be added behind the 
			repairable items in the stock.
			Only weapons and staves (repairable weapon types) are listed in the repair shop list, and non-repairable items 
			such as medicines aren't shown.

		(The following is the setting that becomes effective when isDurabilityUnitItemInRest = true)

		2. I want to change the transparency (alpha value) of the face of the unit
			→ Change RestDurabilityFaceAlpha to a value between 0 and 255.

		3. I want to change the position of the unit's face
			→ Change the values of RestDurabilityFaceDrawXhosei (default 120) and RestDurabilityFaceDrawYhosei (default 0).
			TL note: "hosei" means "correction"

		4. I want to change the width and height of the unit's face
			→ Change the values of RestDurabilityFaceDstWidth (default 96) and RestDurabilityFaceDstHeight (default 24).

		5. I want to change the size (width, height) of the face drawing source
			→ Change the values of RestDurabilityFaceGettingWidth (default 96) and RestDurabilityFaceGettingHeight (default 24).

		6. I want to change the acquisition position of the face drawing source
			→ Change the values of RestDurabilityFaceSrcXHosei (default 0) and RestDurabilityFaceSrcYHosei (default 22).

		TL Note for the above options 3 through 6: These values all get punched into the function drawStretchParts(), a method of images.
		Here is a link to the Image object in the documentation, to hopefully help you understand better: 
		http://srpgstudio.com/english/api/resource.html#Image

[Shopkeeper Messages]
	Please set the following messages to what suits you.
	(TL Note: this is in Game Layout → Shop Layout → Messages tab for the shop in question)
		"Which one do you want to buy?" → User hasn't repaired anything yet
		"Thanks. Do you want to buy anything else?" → User repaired an item
		"Oops, you have too many things." → Item to repair is already at max durability
		"Hmm, nope. I don't want this one." → Selected item can't be repaired

[Current specifications of repair shop]
	Weapons and staves can be repaired in this version of the plugin.
	(Judgment is made by ItemControl._isItemRepairable() in this source, so this could be subject to change)
	If you have set a damaged item for the staff, the damaged item will also be in the category: If you do not 
	set the staff, you will not be able to repair it. Be careful.
	TL note - not sure what's being said about staves, but the gist seems to be that items aren't repairable and staves are, so 
	make sure the item type is correct. (Maybe something to do with "broken weapon/item" in Database → Config → Weapon Types?)

The amount is the standard value of the repair amount multiplied by the percentage of the target durability.
The standard value of the repair amount can be changed by playing with the number part in the 
setting.
	[Example] var repairPricePercent = 50; → repair costs 50% of the purchase price)
		In the case of an item with a durability of 10 and a purchase price of 1000 (essentially worth 100 gold per use), 
		it costs 50 gold for each point of durability repaired.
	If you don't want to calculate by percent, the function you should modify is Calculator.calculateDurabilityPrice();
	(TL note: I paraphrased here^)

 ※ About the name of the repair shop
	The name of the repair shop should be different from other shops.
	Avoid having the same name for both repair shops and ordinary shops (both shops, etc.)
	This is when "Shop" is displayed in the battle preparation of Game Layout → Command Layout
	This is because the store names are compared in the check process to see if it is a repair shop.

Fixes
15/10/02 Newly created
15/10/03 Fixed so that only weapons and wands can be repaired
15/10/12 Fixed so that a repair shop can be set on the battle preparation screen
		(However, it will not work if "Display shop items at the top of the preparation screen" is checked)
15/11/05 Fixed a bug where the repair cost was calculated based on the price of the weapon at the time of damage when the weapon at the time of damage was set.
		Fixed a bug where the repair price of a broken weapon was higher than the original price (half the original price)
16/04/27 1.073 compatible
16/09/22 Fixed a bug where the repair cost was calculated based on the price of the weapon at the time of damage when the wand at the time of damage was set.
		Corrected so that the standard value of the repair amount can be set at n% of the purchase price.
16/09/24 1.094 compatible
16/12/15 1.106 compatible
17/04/19 1.122 compatible
18/12/01 Compatible with "00_Weapon type: Increase wands.js"
18/12/15 Correspondence so that the repair shop can be used even at the base
18/12/28 Temporarily added a setting to skip repair animation (set var isSkipDurability = true; to skip repair animation)
20/02/29 Supports character-walking.js
20/05/18 Added a setting that makes it possible to repair the belongings of the unit at the repair shop located at the base
20/05/21 Fixed a bug that when the unit's belongings can be repaired at the repair shop at the base, it can not be repaired if there are no items in the stock
20/06/13 Fixed a bug that an error occurs when entering a repair shop when "Shop" is displayed in the battle preparation of game layout → command layout.

■ Supported version
SRPG Studio Version: 1.213

■ Terms
・ Use is limited to games using SRPG Studio.
・ It does not matter whether it is commercial or non-commercial. It's free.
・ There is no problem with processing. Please remodel more and more.
・ No credit specified OK
・ Redistribution and reprint OK
・ Wiki posting OK
・ Please comply with the SRPG Studio Terms of Service.
  
--------------------------------------------------------------------------*/


//--------------------------------------
// Settings
//--------------------------------------
// Standard value of repair price (n% of the purchase price. Multiplies this by % of the durability used to obtain the repair cost)
var repairPricePercent = 100;		// must be >= 1
var isSkipDurability = false;		// Skip the item repair event command?

var isDurabilityUnitItemInRest = false;	// Is it possible to repair the belongings of the unit at the base? 

// Settings related to face image when repairing the belongings of the unit at the base
var RestDurabilityFaceAlpha = 128;		// Alpha (transparency) of face image（0-255）

var RestDurabilityFaceDrawXhosei = 120;	// Face image display X correction
var RestDurabilityFaceDrawYhosei = 0;	// Face image display Y correction

var RestDurabilityFaceDstWidth = 96;	// Drawing destination: Width of face image
var RestDurabilityFaceDstHeight = 24;	// Drawing destination: Height of face image

var RestDurabilityFaceGettingWidth = 96;	// Drawing source: Width obtained for drawing from the face image
var RestDurabilityFaceGettingHeight = 24;	// Drawing source: Height obtained for drawing from the face image

var RestDurabilityFaceSrcXHosei = 0;	// Drawing source: Face image acquisition position X correction
var RestDurabilityFaceSrcYHosei = 22;	// Drawing source: Face image acquisition position Y correction

//--------------------------------------
// End of settings section
//--------------------------------------

(function () {

	//-------------------------------------
	// MarshalCommandWindow class
	//-------------------------------------
	// Add shop command to Manage screen
	MarshalCommandWindow._appendShop = function (groupArray) {
		var i, shopData;
		var list = root.getCurrentSession().getCurrentMapInfo().getShopDataList();
		var count = list.getCount();

		// If {Durability: n} is specified in the custom map information of the current chapter, 
		// make the nth shop a repair shop (n is in the range of 0 to [number of shops-1]).
		var durability = -1;
		var mapinfo = root.getCurrentSession().getCurrentMapInfo();
		if (typeof mapinfo.custom.Durability === 'number') {
			durability = mapinfo.custom.Durability;
		}

		for (i = 0; i < count; i++) {
			shopData = list.getData(i);
			if (shopData.getShopItemArray().length > 0) {
				if (i == durability) {
					// Make the nth shop a repair shop (n is in the range of 0 to [number of shops-1])
					groupArray.appendObject(MarshalCommand.Shop2);
				} else {
					groupArray.appendObject(MarshalCommand.Shop);
				}
				groupArray[groupArray.length - 1].setShopData(shopData);
			}
		}
	}




	//-------------------------------------
	// UnitCommand.Shop2 derived class
	//-------------------------------------
	MarshalCommand.Shop2 = defineObject(MarshalCommand.Shop,
		{
			checkCommand: function () {
				var screenParam = this._createScreenParam();

				if (screenParam.unit === null) {
					return false;
				}

				this._shopLayoutScreen = createObject(DurabilityShopLayoutScreen);	// Replaced with a call to the repair shop layout class
				this._shopLayoutScreen.setScreenInteropData(screenParam.shopLayout.getShopInteropData());
				SceneManager.addScreen(this._shopLayoutScreen, screenParam);

				return true;
			}
		}
	);




	//-------------------------------------
	// UnitCommand.Shop class
	//-------------------------------------
	UnitCommand.Shop._moveTop = function () {
		var screenParam;
		var event = this._getEvent();

		if (this._capsuleEvent.moveCapsuleEvent() !== MoveResult.CONTINUE) {
			screenParam = this._createScreenParam();

			if (typeof event.custom.Durability === 'number') {
				this._shopLayoutScreen = createObject(DurabilityShopLayoutScreen);
			} else {
				this._shopLayoutScreen = createObject(ShopLayoutScreen);
			}
			this._shopLayoutScreen.setScreenInteropData(screenParam.shopLayout.getShopInteropData());
			SceneManager.addScreen(this._shopLayoutScreen, screenParam);

			this.changeCycleMode(ShopCommandMode.SCREEN);
		}

		return MoveResult.CONTINUE;
	};




	//-------------------------------------
	// ShopScreenLauncher class
	//-------------------------------------
	var alias00 = ShopScreenLauncher.openScreenLauncher;
	ShopScreenLauncher.openScreenLauncher = function () {
		var i, count, list, shopData, Durability;
		var scene = root.getBaseScene();

		// Set a repair shop if the base store has custom parameter {Durability: 0}
		if (scene === SceneType.REST && typeof this._shopData.custom.Durability === 'number') {
			var screenParam = this._createScreenParam();

			// If isDurabilityUnitItemInRest is false, the unit's belongings cannot be repaired,
			// and DurabilityShopLayoutScreen is created.
			if (isDurabilityUnitItemInRest !== true) {
				this._screen = createObject(DurabilityShopLayoutScreen);
			}
			// Otherwise, create ShopLayoutScreenForRest, which can repair the belongings of the unit.
			else {
				this._screen = createObject(ShopLayoutScreenForRest);
			}
			this._screen.setScreenInteropData(screenParam.shopLayout.getShopInteropData());
			SceneManager.addScreen(this._screen, screenParam);
			return;
		}
		// In the case of a battle prep shop, if the map has the custom parameter {Durability: XX}, set a repair shop
		else if (scene === SceneType.BATTLESETUP) {
			Durability = root.getCurrentSession().getCurrentMapInfo().custom.Durability;
			if (typeof Durability === 'number') {
				list = root.getCurrentSession().getCurrentMapInfo().getShopDataList();
				count = list.getCount();
				for (i = 0; i < count; i++) {
					shopData = list.getData(i);
					// Match store name and check for custom parameter Durability
					if (shopData.getName() === this._shopData.getName() && i === Durability) {
						var screenParam = this._createScreenParam();

						// If isDurabilityUnitItemInRest is false, the unit's belongings cannot be repaired,
						// and DurabilityShopLayoutScreen is created.
						if (isDurabilityUnitItemInRest !== true) {
							this._screen = createObject(DurabilityShopLayoutScreen);
						}
						// Otherwise, create ShopLayoutScreenForRest, which can repair the belongings of the unit.
						else {
							this._screen = createObject(ShopLayoutScreenForRest);
						}
						this._screen.setScreenInteropData(screenParam.shopLayout.getShopInteropData());
						SceneManager.addScreen(this._screen, screenParam);
						return;
					}
				}
			}
		}
		alias00.call(this);
	}




	//-------------------------------------
	// DurabilityChangeEventCommand class
	//-------------------------------------
	DurabilityChangeEventCommand._checkEventCommand = function () {
		// The durability of stock items cannot be changed if they are left as they are.
		if (!this._isStockChange) {
			if (this._targetUnit === null || this._targetItem === null) {
				return false;
			}
		} else {
			if (this._targetItem === null) {
				return false;
			}
		}

		return this.isEventCommandContinue();
	}




	//-------------------------------------
	// StockItemControlクラス
	//-------------------------------------
	StockItemControl.getMatchItem = function (targetItem) {
		var i, item;
		var count = this.getStockItemCount();

		for (i = 0; i < count; i++) {
			item = this.getStockItem(i);
			// Check for exact match of the item
			// (Without this, the behavior will be strange when there are multiple items of the same type)
			if (ItemControl.compareItem(item, targetItem) && item === targetItem) {
				return item;
			}
		}

		return null;
	}




})();




//-------------------------------------
// DurabilityShopLayoutScreen derived class
//-------------------------------------
var DurabilityShopLayoutScreen = defineObject(ShopLayoutScreen,
	{

		_prepareScreenMemberData: function (screenParam) {
			// If unit is null, stock items will be targeted for buying and selling.
			// For example, an item is added to the stock item at the time of purchase.
			// On the other hand, if the unit is not null, it means that some unit has visited the store, 
			// and the unit item is targeted.
			// In other words, the item is added to the item column of the unit.
			this._targetUnit = screenParam.unit;

			this._shopLayout = screenParam.shopLayout;

			// True if you buy or sell even once
			this._isSale = false;

			this._nextmode = 0;
			this._itemSale = createObject(DurabilityItemSale);
			this._itemSale.setParentShopScreen(this);

			this._shopItemArray = screenParam.itemArray;
			this._inventoryArray = screenParam.inventoryArray;
			this._buyItemWindow = createWindowObject(DurabilityItemWindow, this);
			this._sellItemWindow = createWindowObject(SellItemWindow, this);
			this._buySellWindow = createWindowObject(DurabilitySellWindow, this);
			this._buyQuestionWindow = createWindowObject(DurabilityQuestionWindow, this);
			this._sellQuestionWindow = createWindowObject(SellQuestionWindow, this);
			this._visitorSelectWindow = createWindowObject(VisitorSelectWindow, this);
			this._currencyWindow = createWindowObject(ShopCurrencyWindow, this);
			this._keeperWindow = createWindowObject(ShopMessageWindow, this);
			this._itemInfoWindow = createWindowObject(ItemInfoWindow, this);

			this._activeSelectWindow = this._buySellWindow;
			this._activeItemWindow = this._buyItemWindow;

			this._createShopMessageTable(this._shopLayout);
		},

		_moveBuySellSelect: function () {
			var result = this._buySellWindow.moveWindow();

			if (result === BuySellSelectResult.BUY) {
				// If you have a repairable item, go to repair (internal purchase process)
				if (this._buyItemWindow.getItemCount() > 0) {
					this._startMessage(this._shopMessageTable.QuestionBuy, ShopLayoutMode.BUY);
				} else {
					this._playOperationBlockSound();
				}
			} else if (result === BuySellSelectResult.SELL) {
				if (this._isStockSelectable()) {
					// Proceed to unit or stock selection
					this._processMode(ShopLayoutMode.VISITORSELECT);
				} else {
					if (this._buySellWindow.isPossessionItem()) {
						this._startMessage(this._shopMessageTable.QuestionSell, ShopLayoutMode.SELL);
					} else {
						this._startMessage(this._shopMessageTable.NoItemBring, ShopLayoutMode.BUYSELLSELECT);
					}
				}
			} else if (result === BuySellSelectResult.CANCEL) {
				return MoveResult.END;
			}

			return MoveResult.CONTINUE;
		},

		_moveBuyQuestion: function () {
			var result = this._buyQuestionWindow.moveWindow();

			if (result === BuyQuestionResult.BUY) {
				// Since "Buy" was selected, actually buy
				this._startSale(true, false);
				this._startMessage(this._shopMessageTable.EndBuy, ShopLayoutMode.BUY);
			} else if (result === BuyQuestionResult.CANCEL) {
				this._startMessage(this._shopMessageTable.QuestionBuy, ShopLayoutMode.BUY);
			} else if (result === BuyQuestionResult.NOGOLD) {
				this._startMessage(this._shopMessageTable.NoGold, ShopLayoutMode.BUY);
			} else if (result === BuyQuestionResult.ITEMFULL) {
				this._startMessage(this._shopMessageTable.ItemFull, ShopLayoutMode.BUY);
			} else if (result === BuyQuestionResult.NOSELL) {
				// In the case of a repair shop, if the return value is BuyQuestionResult.NOSELL, 
				// it means that an item that cannot be repaired has been specified.
				this._startMessage(this._shopMessageTable.NoSell, ShopLayoutMode.BUY);
			}

			return MoveResult.CONTINUE;
		},

		_startSale: function (isBuy, isForceStock) {
			var price = this._itemSale.startSale(isBuy, isForceStock, this._activeItemWindow.getShopSelectItem());

			// Change the contents of the window that displays gold
			this._currencyWindow.startPriceCount(price);

			this._isSale = true;

			// Always call because you increase items when you buy and decrease items when you sell
			this._sellItemWindow.updateItemArea();
			this._buyItemWindow.updateItemArea();

			this._playSaleSound();
		},

		_playOperationBlockSound: function () {
			MediaControl.soundDirect('operationblock');
		}
	}
);




//-------------------------------------
// DurabilityItemSale derived class
//-------------------------------------
var DurabilityItemSale = defineObject(ItemSale,
	{
		_parentShopScreen: null,

		startSale: function (isDurability, isForceStock, item) {
			var price = this._getPrice(isDurability, item);

			if (isDurability) {
				this._durabilityItem(item);
			} else {
				this._cutSellItem(item);
			}

			this._setPrice(price);

			return price;
		},

		_durabilityItem: function (item) {
			var unit = this._parentShopScreen.getVisitor();
			var increaseType = IncreaseType.ASSIGNMENT;
			var generator = root.getEventGenerator();
			var durability = item.getLimitMax();

			if (unit != null) {
				generator.itemDurabilityChange(unit, item, durability, increaseType, isSkipDurability);
			} else {
				generator.stockDurabilityChange(item, durability, increaseType, isSkipDurability);
			}
			generator.execute();
		},

		_getPrice: function (isDurability, item) {
			var price;

			if (isDurability) {
				price = Calculator.calculateDurabilityPrice(item);
				price *= -1;
			} else {
				price = Calculator.calculateSellPrice(item);
			}

			return price;
		},

		_setPrice: function (price) {
			this._parentShopScreen.setGold(this._parentShopScreen.getGold() + price);
		}
	}
);




//-------------------------------------
// DurabilitySellWindow derived class
//-------------------------------------
var DurabilitySellWindow = defineObject(BuySellWindow,
	{
		moveWindowContent: function () {
			var input = this._scrollbar.moveInput();
			var result = BuySellSelectResult.NONE;

			if (input === ScrollbarInput.SELECT) {
				if (this._scrollbar.getIndex() === 0) {
					result = BuySellSelectResult.BUY;
				} else {
					result = BuySellSelectResult.SELL;
				}
			} else if (input === ScrollbarInput.CANCEL) {
				result = BuySellSelectResult.CANCEL;
			} else {
				result = BuySellSelectResult.NONE;
			}

			return result;
		},

		getSelectTextArray: function () {
			var arr = ['Repair', StringTable.ShopLayout_SelectSell];
			return arr;
		}
	}
);




//-------------------------------------
// DurabilityQuestionWindow derived class
//-------------------------------------
BuyQuestionResult.NOSELL = 999;	// Items that cannot be sold (new value for BuyQuestionResult enum from screen-shop.js)
var DurabilityQuestionWindow = defineObject(BuyQuestionWindow,
	{
		moveWindowContent: function () {
			var input = this._scrollbar.moveInput();
			var result = BuyQuestionResult.NONE;

			if (input === ScrollbarInput.SELECT) {
				if (this._scrollbar.getIndex() === 0) {
					if (!this._isPriceOk()) {
						// "Not enough gold"
						result = BuyQuestionResult.NOGOLD;
					} else if (!this._isItemRepairable()) {
						// "Can't repair this item" (internally "can't sell this item" since it's a shop)
						result = BuyQuestionResult.NOSELL;
					} else if (this._isDurabilityMax()) {
						// "Item's at full durability" (internally "your inventory is full")
						result = BuyQuestionResult.ITEMFULL;
					} else {
						result = BuyQuestionResult.BUY;
					}
				} else {
					result = BuyQuestionResult.CANCEL;
				}
			} else if (input === ScrollbarInput.CANCEL) {
				result = BuyQuestionResult.CANCEL;
			}

			return result;
		},

		_isDurabilityMax: function () {
			var item = this.getParentInstance().getSelectItem();
			return (item.getLimitMax() == item.getLimit());
		},

		// Do you have enough money?
		_isPriceOk: function () {
			var gold = this.getParentInstance().getGold();
			var item = this.getParentInstance().getSelectItem();
			var itemGold = Calculator.calculateDurabilityPrice(item);
			return gold >= itemGold;
		},

		// Is it a repairable item?
		_isItemRepairable: function () {
			var item = this.getParentInstance().getSelectItem();
			var unit = this.getParentInstance().getVisitor();

			return ItemControl._isItemRepairable(unit, item);
		}
	}
);




//-------------------------------------
// DurabilityItemWindow derived class
//-------------------------------------
var DurabilityItemWindow = defineObject(SellItemWindow,
	{
		getScrollbarObject: function () {
			return DurabilityScrollbar;
		},

		updateItemArea: function () {
			var i, item, count;
			var unit = this.getParentInstance().getVisitor();

			if (this._unit === unit) {
				this._scrollbar.saveScroll();
			}

			this._scrollbar.resetScrollData();

			if (unit !== null) {
				count = DataConfig.getMaxUnitItemCount();
				for (i = 0; i < count; i++) {
					item = UnitItemControl.getItem(unit, i);
					if (item !== null) {
						this._scrollbar.objectSet(item);
					}
				}
			} else {
				count = StockItemControl.getStockItemCount();
				for (i = 0; i < count; i++) {
					item = StockItemControl.getStockItem(i);
					if (item !== null) {
						this._scrollbar.objectSet(item);
					}
				}
			}

			this._scrollbar.objectSetEnd();
			this._scrollbar.resetAvailableData();

			// If you have not changed the seller, keep the previous scroll position
			if (this._unit === unit) {
				this._scrollbar.restoreScroll();
			}

			this._unit = unit;
		}
	}
);




//-------------------------------------
// DurabilityScrollbar derived class
//-------------------------------------
var DurabilityScrollbar = defineObject(SellScrollbar,
	{
		drawScrollContent: function (x, y, object, isSelect, index) {
			var textui = this.getParentTextUI();
			var color = textui.getColor();
			var font = textui.getFont();
			var item = object;

			// Gray text if not repairable
			if (!this._isItemRepairable(object)) {
				color = ColorValue.DISABLE;
			}

			var gold = Calculator.calculateDurabilityPrice(item);

			ItemRenderer.drawShopItem(x, y, item, color, font, Calculator.calculateDurabilityPrice(item), 0);
		},

		_isItemRepairable: function (item) {
			var unit = this.getParentInstance().getParentInstance().getVisitor();

			return ItemControl._isItemRepairable(unit, item);
		}
	}
);




//-------------------------------------
// Calculator class
//-------------------------------------
// Calculation of the amount to charge for repairs (calculated by multiplying half of the purchase price by % of the durability used)
Calculator._weaponlist = null;
Calculator._itemlist = null;

Calculator.calculateDurabilityPrice = function (item) {
	var d;
	var item_original;	// Original item (measures when the weapon at the time of damage is set)
	// TL note: fixed a typo here, was "item_priginal" in all instances

	if (Calculator._weaponlist == null) {
		Calculator._weaponlist = root.getBaseData().getWeaponList();
	}

	if (Calculator._itemlist == null) {
		Calculator._itemlist = root.getBaseData().getItemList();
	}

	if (item.isWeapon() == true) {
		// Since there are times when the weapon at the time of damage is set, 
		// the original weapon data is extracted based on the ID
		item_original = Calculator._weaponlist.getDataFromId(item.getId());
	} else {
		// Ditto but for items
		item_original = Calculator._itemlist.getDataFromId(item.getId());
	}

	// Set the repair amount as a percentage of the purchase price
	var repair_percent = repairPricePercent;
	if (repair_percent < 1) {
		repair_percent = 1;		// No lower than 1%
	}

	// Repair amount calculation
	var gold = item_original.getGold() * repair_percent / 100;

	if (item.getLimitMax() === 0) {
		d = 1;
	} else {
		// The lower limit of the remaining durability value is 0
		// (because the remaining durability value could potentially be negative if the weapon is set to be damaged).
		var limit = item.getLimit();
		if (limit < 0) {
			limit = 0;
		}
		d = (item.getLimitMax() - limit) / item.getLimitMax();
	}

	gold = Math.floor(gold * d);
	return gold;
};




//-------------------------------------
// ItemControl class
//-------------------------------------
ItemControl._isItemRepairable = function (unit, item) {
	//		if (unit === null) {
	//			return false;
	//		}

	if (item.isWeapon()) {
		return true;
	} else if (item.isWand()) {
		return true;
	} else if (typeof isWandTypeExtra !== 'undefined') { // When adding a weapon type
		if (WandChecker.isWand(item)) {
			return true;
		}
	}

	return false;
};




//-------------------------------------
// ShopLayoutScreenForRest derived class
//-------------------------------------
var ShopLayoutScreenForRest = defineObject(DurabilityShopLayoutScreen,
	{

		_prepareScreenMemberData: function (screenParam) {
			// If unit is null, stock items will be targeted for buying and selling.
			// For example, an item is added to the stock item at the time of purchase.
			// On the other hand, if unit is not null, it means that some unit has visited the store, and the unit item is targeted.
			// In other words, the item is added to the item column of the unit.
			this._targetUnit = screenParam.unit;

			this._shopLayout = screenParam.shopLayout;

			// True if you buy or sell even once
			this._isSale = false;

			this._nextmode = 0;
			this._itemSale = createObject(ItemSaleForRest);
			this._itemSale.setParentShopScreen(this);

			this._shopItemArray = screenParam.itemArray;
			this._inventoryArray = screenParam.inventoryArray;
			this._buyItemWindow = createWindowObject(DurabilityItemWindowForRest, this);
			this._sellItemWindow = createWindowObject(SellItemWindow, this);
			this._buySellWindow = createWindowObject(DurabilitySellWindow, this);
			this._buyQuestionWindow = createWindowObject(DurabilityQuestionWindow, this);
			this._sellQuestionWindow = createWindowObject(SellQuestionWindow, this);
			this._visitorSelectWindow = createWindowObject(VisitorSelectWindow, this);
			this._currencyWindow = createWindowObject(ShopCurrencyWindow, this);
			this._keeperWindow = createWindowObject(ShopMessageWindow, this);
			this._itemInfoWindow = createWindowObject(ItemInfoWindow, this);

			this._activeSelectWindow = this._buySellWindow;
			this._activeItemWindow = this._buyItemWindow;

			this._createShopMessageTable(this._shopLayout);
		}
	}
);




//-------------------------------------
// ItemSaleForRest derived class
//-------------------------------------
var ItemSaleForRest = defineObject(DurabilityItemSale,
	{
		_durabilityItem: function (item) {
			var unit = this._parentShopScreen.getVisitor();
			var increaseType = IncreaseType.ASSIGNMENT;
			var generator = root.getEventGenerator();
			var durability = item.getLimitMax();
			var durabilityUnit;

			if (unit != null) {
				generator.itemDurabilityChange(unit, item, durability, increaseType, isSkipDurability);
			} else {
				durabilityUnit = this._parentShopScreen._activeItemWindow.getDurabilityUnit();

				if (durabilityUnit == null) {
					generator.stockDurabilityChange(item, durability, increaseType, isSkipDurability);
				} else {
					generator.itemDurabilityChange(durabilityUnit, item, durability, increaseType, isSkipDurability);
				}
			}
			generator.execute();
		}
	}
);




//-------------------------------------
// DurabilityItemWindowForRest derived class
//-------------------------------------
var DurabilityItemWindowForRest = defineObject(DurabilityItemWindow,
	{
		getScrollbarObject: function () {
			return DurabilityScrollbarForRest;
		},

		getDurabilityUnit: function () {
			return this._scrollbar.getDurabilityUnit();
		},

		updateItemArea: function () {
			var i, item, count;
			var unit = this.getParentInstance().getVisitor();
			var durabilityUnit, list, j, unitCount;

			if (this._unit === unit) {
				this._scrollbar.saveScroll();
			}

			this._scrollbar.resetScrollData();

			if (unit !== null) {
				count = DataConfig.getMaxUnitItemCount();
				for (i = 0; i < count; i++) {
					item = UnitItemControl.getItem(unit, i);
					if (item !== null) {
						this._scrollbar.objectSet(item);
					}
				}
			} else {
				count = StockItemControl.getStockItemCount();
				for (i = 0; i < count; i++) {
					item = StockItemControl.getStockItem(i);
					// In the case of a base, do not register items that cannot be repaired 
					// (because the number of stock + units will be enormous)
					if (item !== null && ItemControl._isItemRepairable(unit, item) === true) {
						this._scrollbar.objectSet(item);
						this._scrollbar.setDurabilityUnit(null);
					}
				}

				list = PlayerList.getAliveList();
				unitCount = list.getCount();
				for (j = 0; j < unitCount; j++) {
					durabilityUnit = list.getData(j);

					count = DataConfig.getMaxUnitItemCount();
					for (i = 0; i < count; i++) {
						item = UnitItemControl.getItem(durabilityUnit, i);
						// In the case of a base, do not include items that cannot be repaired 
						// (because the number of stock + units will be enormous)
						if (item !== null && ItemControl._isItemRepairable(durabilityUnit, item) === true) {
							this._scrollbar.objectSet(item);
							this._scrollbar.setDurabilityUnit(durabilityUnit);
						}
					}
				}
			}

			this._scrollbar.objectSetEnd();
			this._scrollbar.resetAvailableData();

			// Keep the previous scroll position if you haven't changed the seller
			if (this._unit === unit) {
				this._scrollbar.restoreScroll();
			}

			this._unit = unit;
		}
	}
);




//-------------------------------------
// DurabilityScrollbarForRest derived class
//-------------------------------------
var DurabilityScrollbarForRest = defineObject(DurabilityScrollbar,
	{
		_durabilityUnitArray: [],

		drawScrollContent: function (x, y, object, isSelect, index) {
			var textui = this.getParentTextUI();
			var color = textui.getColor();
			var font = textui.getFont();
			var item = object;
			var durabilityUnit = this.getDurabilityUnitFromIndex(index);

			if (durabilityUnit != null) {
				this.drawUnitFace(x, y, durabilityUnit, RestDurabilityFaceAlpha);
			}

			// Gray text if not repairable
			if (!this._isItemRepairable(object)) {
				color = ColorValue.DISABLE;
			}

			var gold = Calculator.calculateDurabilityPrice(item);

			ItemRenderer.drawShopItem(x, y, item, color, font, Calculator.calculateDurabilityPrice(item), 0);
		},

		getDurabilityUnit: function () {
			return this.getDurabilityUnitFromIndex(this.getIndex());
		},

		getDurabilityUnitFromIndex: function (index) {
			if (this._durabilityUnitArray === null || this._durabilityUnitArray.length === 0) {
				return null;
			}

			return this._durabilityUnitArray[index];
		},

		setDurabilityUnit: function (unit) {
			this._durabilityUnitArray.push(unit);
		},

		resetScrollData: function () {
			DurabilityScrollbar.resetScrollData.call(this);

			this._durabilityUnitArray = [];
		},

		drawUnitFace: function (x, y, unit, alpha) {
			var handle = unit.getFaceResourceHandle();
			var pic = GraphicsRenderer.getGraphics(handle, GraphicsType.FACE);

			if (pic === null) {
				return;
			}

			pic.setReverse(false);
			pic.setAlpha(alpha);

			this._drawShrinkFace(x + RestDurabilityFaceDrawXhosei, y + RestDurabilityFaceDrawYhosei, handle, pic);
		},

		_drawShrinkFace: function (xDest, yDest, handle, pic) {
			var xSrc, ySrc;
			var destWidth = RestDurabilityFaceDstWidth;
			var destHeight = RestDurabilityFaceDstHeight;
			var srcGettingWidth = RestDurabilityFaceGettingWidth;
			var srcGettingHeight = RestDurabilityFaceGettingHeight;
			var srcWidth = GraphicsFormat.FACE_WIDTH;
			var srcHeight = GraphicsFormat.FACE_HEIGHT;

			if (root.isLargeFaceUse() && pic.isLargeImage()) {
				srcWidth = root.getLargeFaceWidth();
				srcHeight = root.getLargeFaceHeight();
			}

			xSrc = handle.getSrcX() * srcWidth + RestDurabilityFaceSrcXHosei;
			ySrc = handle.getSrcY() * srcHeight + RestDurabilityFaceSrcYHosei;
			pic.drawStretchParts(xDest, yDest, destWidth, destHeight, xSrc, ySrc, srcGettingWidth, srcGettingHeight);
		}
	}
);
