(function(context) {
	
	/**
	* Creates a new Csv exporter object
	*
	* @constructor
	* @this {Csv}
	* @param {String[]} propertyOrder The order of the object properties to export
	*/
	function Csv(propertyOrder) {
		this.propertyOrder = propertyOrder;
		this.items = [];
	}
	
	/**
	* Creates a new Csv exporter object from an array of items and, optionally, the order of the object properties
	*
	* @expose
	* @param {Object[]} items The items to export
	* @param {String[]} [optionalOrderOfProperties] The order of the object properties to export
	* @return {Csv} The new Csv object
	*/
	Csv.autoCreate = function(items, optionalOrderOfProperties) {
		if (items && Array.isArray(items) && items.length > 0) {
			var properties = optionalOrderOfProperties || items[0].getOwnPropertyNames();
			
			var result = new Csv(properties);
			
			items.forEach(function(item) {
				result.add(item);
			});
			
			return result;
		} else {
			return null;
		}
	};
	
	/**
	* @private
	*/
	function createTextLine(values, separator) {
		var result = [];
		
		values.forEach(function(value) {
			var text = value.toString();
			
			if (text.indexOf(separator) == -1 && text.indexOf('"') == -1) {
				result.push(text);
			} else {
				result.push('"' + text.replace(/"/g, '""') + '"');
			}
		});
		
		return result.join(separator);
	}
	
	/**
	* Adds a new item to the exporter
	*
	* @this {Csv}
	* @expose
	* @param {Object} item The item to add
	*/
	Csv.prototype.add = function(item) {
		this.items.push(item);
	};
	
	/**
	* Creates and returns the CSV file contents
	*
	* @this {Csv}
	* @param {String} [separator=","] The separator to use (default: comma)
	* @param {Boolean} [includePropertyNames] Pass true to automatically use property names as column headers (default: false)
	*/
	Csv.prototype.getFileContents = function(separator, includePropertyNames) {
		separator = separator || ",";
		
		var textLines = [];
		if (includePropertyNames) {
			textLines.push(createTextLine(this.propertyOrder, separator));
		}
		
		this.items.forEach((function(item) {
			var values = [];
			this.propertyOrder.forEach(function(propertyName) {
				values.push(item[propertyName]);
			});
			
			textLines.push(createTextLine(values, separator));
		}).bind(this));
		
		return textLines.join("\r\n");
	};
	
	/**
	* Saves a CSV file to local disk
	*
	* @this {Csv}
	* @expose
	* @param {String} filename The name of the file to create
	* @param {String} [separator=","] The separator to use (default: comma)
	* @param {Boolean} [includePropertyNames=false] Pass true to automatically use property names as column headers (default: false)
	*/
	Csv.prototype.saveAs = function(filename, separator, includePropertyNames) {
		var fullFileContents = this.getFileContents(separator, includePropertyNames);
		
		// var bom = new Uint8Array([0xef, 0xbb, 0xbf]);
		// var fileAsBlob = new Blob([bom, fullFileContents], {type:'text/csv'});

		var fileAsBlob = new Blob(["\ufeff", fullFileContents], {type:'text/csv'});
		
		context.saveAs(fileAsBlob, filename);
	};
	
	context["Csv"] = Csv;
	
})(window);