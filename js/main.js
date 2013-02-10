
$(function() {

  Parse.$ = jQuery;

  // Initialize Parse with your Parse application javascript keys
  Parse.initialize("yaH11lzPCB3w9ExzINJfcRq34YK1u7yRuUgOPko3", "uNYybtZweTwox5bW1ETykpkNdZhvHaaQCn0BFpTU");

  // "Spot" Model
  // ----------
  
  var Spot = Parse.Object.extend("Spot", {
    // Default attributes.
    defaults: {
      //content: "...",
      //done: false
    },

    // Ensure that each Spot created has `content`.
    initialize: function() {
      if (!this.get("content")) {
        //this.set({"content": this.defaults.content});
      }
    },

    // Toggle the `done` state of this Spot item.
    toggle: function() {
      //this.save({done: !this.get("done")});
    }
  });

  // Spot Collection
  // ---------------

  var SpotList = Parse.Collection.extend({

    // Reference to this collection's model.
    model: Spot,

    // Filter down the list of all Spot items that are finished.
    done: function() {
      //return this.filter(function(spot){ return spot.get('done'); });
    },

    // Filter down the list to only Spot items that are still not finished.
    remaining: function() {
      //return this.without.apply(this, this.done());
    },

    // We keep the Spots in sequential order, despite being saved by unordered
    // GUID in the database. This generates the next order number for new items.
    nextOrder: function() {
      //if (!this.length) return 1;
      //return this.last().get('order') + 1;
    },

    // Spots are sorted by their original insertion order.
    comparator: function(spot) {
      return spot.get('order');
    }

  });

});
