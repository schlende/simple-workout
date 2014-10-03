var app = {
    addFormListener: function(){
        var form = document.getElementById('workout-submit');
        console.log("Device is ready " + form);

        var self = this;
        form.addEventListener("submit", function(e){
            console.log("Got into form process function");
            e.preventDefault();


            var description = e.target.description.value;
            var result = e.target.result.value;

            self.storeNewRecord(description, result);

            return false;
        }, false);
    },

    storeNewRecord: function(description, result){
        var db = this.getDbHandle();

        if (db) {
            if (description !== "" && result !== "") {
                var self = this
                db.transaction(function(t) {
                    t.executeSql("INSERT INTO WorkoutRecords (description, result, date) VALUES (?, ?, ?)", [description, result, self.getCurrentDate()]);
                });

                console.log("Records saved");
                if(navigator.notification){
                    navigator.notification.alert("Workout record created!", function(){}, "Success");
                }else{
                    alert("Workout saved");
                }

                document.getElementById('workout-submit').reset();
            } else {
                if(navigator.notification){
                    navigator.notification.alert("You must enter a workout and a result!", function(){}, "Error");
                }else{
                    alert("You must enter a workout and a result!");
                }
            }
        }else{
            console.log("Database not found");
        }
    },

    getRecords: function(){
        var db = this.getDbHandle();
        if (db) {
            var self = this;
            db.transaction(function(t) {
                t.executeSql("SELECT * FROM WorkoutRecords ORDER BY id DESC", [], self.updateWorkoutRecords);
            });
        }else{
            console.log("Database not found");
        }
    },

    updateWorkoutRecords: function(transaction, records){
        console.log("Got the workout records");

        var listholder = document.getElementById("workout-records");
        if(listholder){
            listholder.innerHTML = "";

            for (var i=0; i < records.rows.length; i++){
                var row = records.rows.item(i);
                listholder.innerHTML += "<tr><td>" + row.description + "<br/><small><i>" + row.date + "</i></small></td><td>" + row.result + "</td><td><a href='#' onclick='app.deleteRecord(" + row.id + ")'><img src='img/delete.png' class='delete'/></a></td></tr>";
            }
        }
    },

    getDbHandle: function(){
        if(this.db == null){
            this.db = openDatabase('workout-records', '1.0', 'Workout record database', 2 * 1024 * 1024);
            this.db.transaction(
                function(t) {
                    t.executeSql("CREATE TABLE IF NOT EXISTS WorkoutRecords (id INTEGER PRIMARY KEY ASC, description TEXT, result TEXT, date TEXT)");
                },
                function nullDataHandler(transaction, results)   {
                    console.log("No data returned");
                },
                function killTransaction(transaction, error) {
                    console.log(error);
                }
            );
        }

        return this.db;
    },

    deleteRecord: function(id){
        console.log(id);
        if(navigator.notification){
            var self = this;
            navigator.notification.confirm("Are you sure you want to delete this entry?", function(idx){
                if(idx == 1){
                    self.doDelete(id);
                }
            }, "Are you sure?");
        }else{
            this.doDelete(id);
        }
    },

    doDelete: function(id){
        var db = this.getDbHandle();
        if (db) {
            var self = this;
            db.transaction(function(t) {
                t.executeSql("DELETE FROM WorkoutRecords WHERE id = ?", [id], function(){
                    self.getRecords();
                });
            });
        }else{
            console.log("Database not found");
        }
    },

    getCurrentDate: function(){
        var dateObj = new Date();

        var month = dateObj.getUTCMonth() + 1; //months from 1-12
        var day = dateObj.getUTCDate();
        var year = dateObj.getUTCFullYear();

        newdate = month + "/" + day + "/" + year;
        return newdate;
    }
};


