(function(ut, Csv, window) {
	"use strict";
	
	var engine = new ut.Engine();
	
	engine.add("Csv constructor should save properties order",
	function(testContext, the) {
		// Arrange
		var properties = ["a", "b"];
		
		// Act
		var csv = new Csv(properties);
		
		// Assert
		the("propertyOrder").propertyOf(csv).shouldBeSameArrayAs(properties);
	});
	
	engine.add("Csv constructor should initiate the items property",
	function(testContext, the) {
		// Arrange
		var properties = ["a", "b"];
		
		// Act
		var csv = new Csv(properties);
		
		// Assert
		the("items").propertyOf(csv).shouldBeArray();
		the("length").propertyOf(csv.items).shouldBeExactly(0);
	});
	
	engine.add("Csv.add should add one item",
	function(testContext, the) {
		// Arrange
		var properties = ["a", "b"];
		var csv = new Csv(properties);
		
		// Act
		csv.add({"a" : 1, "b" : 2});
		
		// Assert
		the("length").propertyOf(csv.items).shouldBeExactly(1);
		the("a").propertyOf(csv.items[0]).shouldBeExactly(1);
		the("b").propertyOf(csv.items[0]).shouldBeExactly(2);
	});
	
	engine.add("Csv.getFileContents should create file correctly",
	function(testContext, the) {
		// Arrange
		var properties = ["a", "b"];
		var csv = new Csv(properties);
		csv.add({"a" : "Abc", "b" : "Def"});
		csv.add({"a" : "Ghi", "b" : "Jkl"});
		
		// Act
		var file = csv.getFileContents();
		
		// Assert
		the(file).shouldBeSameAs("Abc,Def\r\nGhi,Jkl");
	});
	
	engine.add("Csv.getFileContents(separator) should create file correctly",
	function(testContext, the) {
		// Arrange
		var properties = ["a", "b"];
		var csv = new Csv(properties);
		csv.add({"a" : "Abc", "b" : "Def"});
		csv.add({"a" : "Ghi", "b" : "Jkl"});
		
		// Act
		var file = csv.getFileContents(";");
		
		// Assert
		the(file).shouldBeSameAs("Abc;Def\r\nGhi;Jkl");
	});
	
	engine.add("Csv.getFileContents(separator, true) should create file correctly",
	function(testContext, the) {
		// Arrange
		var properties = ["a", "b"];
		var csv = new Csv(properties);
		csv.add({"a" : "Abc", "b" : "Def"});
		csv.add({"a" : "Ghi", "b" : "Jkl"});
		
		// Act
		var file = csv.getFileContents(";", true);
		
		// Assert
		the(file).shouldBeSameAs("a;b\r\nAbc;Def\r\nGhi;Jkl");
	});
	
	engine.add("Csv.getFileContents should quote fields containing the separator",
	function(testContext, the) {
		// Arrange
		var properties = ["name", "age"];
		var csv = new Csv(properties);
		csv.add({"name" : "Doe, John", "age" : "Unknown"});
		csv.add({"name" : "Bunny", "age" : "2"});
		
		// Act
		var file = csv.getFileContents();
		
		// Assert
		the(file).shouldBeSameAs("\"Doe, John\",Unknown\r\nBunny,2");
	});
	
	engine.add("Csv.getFileContents should quote and escape fields containing double quotes",
	function(testContext, the) {
		// Arrange
		var properties = ["model", "size"];
		var csv = new Csv(properties);
		csv.add({"model" : "Punysonic", "size" : "28\""});
		csv.add({"model" : "Philip", "size" : "42\""});
		
		// Act
		var file = csv.getFileContents();
		
		// Assert
		the(file).shouldBeSameAs('Punysonic,"28"""\r\nPhilip,"42"""');
	});
	
	engine.add("Csv.saveAs should call window.saveAs correctly",
	function(testContext, the) {
		// Arrange
		var properties = ["a", "b"];
		var csv = new Csv(properties);
		csv.add({"a" : "Abc", "b" : "Def"});
		csv.add({"a" : "Ghi", "b" : "Jkl"});
		
		var saveAsCalled = false, savedBlob, savedFilename;
		var mockSaveAs = function(blob, filename) {
			saveAsCalled = true;
			savedBlob = blob;
			savedFilename = filename;
		};
		
		var oldSaveAs = window.saveAs;
		window.saveAs = mockSaveAs;
		
		// Act
		csv.saveAs("output.csv", ";", false);
		
		// Cleanup
		window.saveAs = oldSaveAs;
		
		// Assert
		the(saveAsCalled).shouldBeTrue();
		the(savedBlob).shouldBeInstanceOf(window.Blob);
		the(savedFilename).shouldBeSameAs("output.csv");
	});
	
	engine.add("Csv.saveAs should add UTF-8 Byte Order Mark to beginning of file",
	function(testContext, the) {
		// Arrange
		var properties = ["a", "b"];
		var csv = new Csv(properties);
		csv.add({"a" : "Abc", "b" : "Def"});
		csv.add({"a" : "Ghi", "b" : "Jkl"});
		
		var savedBlob;
		var mockSaveAs = function(blob, filename) {
			savedBlob = blob;
		};
		
		var oldSaveAs = window.saveAs;
		window.saveAs = mockSaveAs;
		
		// Act
		csv.saveAs("output.csv", ";", false);
		
		// Cleanup
		window.saveAs = oldSaveAs;
		
		// Assert
		var bom;
		testContext.actAndWait(1000, function(testContext, the) {
			var reader = new window.FileReader();
			reader.addEventListener("loadend", function() {
				bom = reader.result;
				testContext.actDone();
			});
			var firstThreeBytes = savedBlob.slice(0, 3);
			reader.readAsArrayBuffer(firstThreeBytes);
		}).thenAssert(function(testContext, the) {
			the(bom).shouldBeSameArrayAs([0xef, 0xbb, 0xbf]);
		});
	});
})(ut, Csv, window);
