from flask import Flask, request, jsonify, make_response
from pymongo import MongoClient
from bson import ObjectId
import jwt
import datetime
from functools import wraps
import bcrypt
from flask_cors import CORS
import string

app = Flask(__name__)
CORS(app)

app.config['SECRET_KEY'] = 'mysecret'

client = MongoClient( "mongodb://127.0.0.1:27017")
db = client.comicDB
comics = db.comics
collections = db.collections
users = db.users
blacklist = db.blacklist

def jwt_required(func):
    @wraps(func)
    def jwt_required_wrapper(*args, **kwargs):
        token = None
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']
        if not token:
            return jsonify( {'message' : 'Token is missing'}), 401
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'])
        except:
            return jsonify( {'message' : 'Token is invalid'}), 401
    
        bl_token = blacklist.find_one( { "token": token } )
        if bl_token is not None:
            return make_response( jsonify( { 'message' : 'Token has been cancelled' }))
        return func(*args, **kwargs)

    return jwt_required_wrapper

def admin_required(func):
    @wraps(func)
    def admin_required_wrapper(args, **kwargs):
        token = request.headers['x-access-token']
        data = jwt.decode(token, app.config['SECRET_KEY'] )
        if data["admin"]:
            return func(args, **kwargs)
        else:
            return make_response( jsonify( { 'message' : 'Admin access required'} ),401 )
        
    return admin_required_wrapper

@app.route("/api/v1.0/comics", methods=["GET"])
def show_all_comics():

    # Set up pagination for list of comics
    page_num, page_size = 1,10
    if request.args.get("pn"):
        page_num = int(request.args.get('pn'))
    if request.args.get("ps"):
        page_size = int(request.args.get('ps'))
    page_start = (page_size * (page_num - 1))

    # Find all comics in the comics collection
    data_to_return = []
    for comic in comics.find().skip(page_start).limit(page_size):
        comic["_id"] = str(comic["_id"])
        for review in comic["reviews"]:
            review["_id"] = str(review["_id"])
        comic["review_count"] = len(comic["reviews"])
        data_to_return.append(comic)

    return make_response( jsonify( data_to_return ), 200 )

@app.route("/api/v1.0/comics/<string:id>", methods=["GET"])
def show_one_comic(id):

    # Validate comic id
    if len(id) != 24 or not all(c in string.hexdigits for c in id):
        return make_response( jsonify( { "error" : "Invalid comic ID"} ), 404 )

    # Find comic matching the given id in the comics collection
    comic = comics.find_one( { "_id" : ObjectId(id) } )
    if comic is not None:
        comic["_id"] = str(comic["_id"])
        for review in comic["reviews"]:
            review["_id"] = str(review["_id"])
        comic["review_count"] = len(comic["reviews"])
        return make_response( jsonify ( [comic] ), 200)
    else:
        return make_response( jsonify( { "error" : "Invalid comic ID"} ), 404 )

@app.route("/api/v1.0/comics/search/<string:issue_title>", methods=["GET"])
def search_all_comics(issue_title):

    # Set up pagination for list of comics
    page_num, page_size = 1,10
    if request.args.get("pn"):
        page_num = int(request.args.get('pn'))
    if request.args.get("ps"):
        page_size = int(request.args.get('ps'))
    page_start = (page_size * (page_num - 1))

    # Find all comics matching the given comic name in the comics collection
    data_to_return = []
    for comic in comics.find( { "issue_title" :{'$regex': issue_title, '$options': 'i' }} ).skip(page_start).limit(page_size):
        comic["_id"] = str(comic["_id"])
        for review in comic["reviews"]:
            review["_id"] = str(review["_id"])
        comic["review_count"] = len(comic["reviews"])
        data_to_return.append(comic)

    return make_response( jsonify( data_to_return ), 200 )
    
@app.route("/api/v1.0/comics", methods=["POST"])
def add_new_comic():

    # Validate the request form data and put it in the new comic
    if "issue_title" in request.form and "issue_description" in request.form and "publish_date" in request.form and "writer" in request.form and "penciler" in request.form and "cover_artist" in request.form:
        new_comic = {
        "issue_title": request.form["issue_title"],
        "issue_description": request.form["issue_description"],
        "publish_date": request.form["publish_date"],
        "writer": request.form["writer"],
        "penciler": request.form["penciler"],
        "cover_artist": request.form["cover_artist"],
        "image_url": request.form["image_url"],
        "reviews": [],
        "review_count": 0,
        }
        # Add new comic to the comics collection
        new_comic_id = comics.insert_one(new_comic)
        new_comic_link = "http://localhost:5000/api/v1.0/comics/" + \
            str(new_comic_id.inserted_id)
        return make_response( jsonify( { "url" : new_comic_link} ), 201 )
    else:
        return make_response( jsonify( { "error" : "Missing Form Data"} ), 404 )
    
@app.route("/api/v1.0/comics/<string:id>", methods=["PUT"])
def edit_comic(id):

    # Validate comic id
    if len(id) != 24 or not all(c in string.hexdigits for c in id):
        return make_response( jsonify( { "error" : "Invalid comic ID"} ), 404 )

    # Validate the request form data and update the matching comic in the comics collection
    if "issue_title" in request.form and "issue_description" in request.form and "publish_date" in request.form:
        result = comics.update_one(
            { "_id" : ObjectId(id) },
            {
                "$set" : {
                    "issue_title" : request.form["issue_title"],
                    "issue_description"  : request.form["issue_description"],
                    "publish_date" : request.form["publish_date"],
                    "writer": request.form["writer"],
                    "penciler": request.form["penciler"],
                    "cover_artist": request.form["cover_artist"],
                    "image_url": request.form["image_url"],
                }
            }
        )
        if result.matched_count == 1:
            edited_comic_link = "http://localhost:5000/api/v1.0/comics/" + id
            return make_response( jsonify( edited_comic_link ), 200 )
        else:
            return make_response( jsonify( { "error" : "Invalid comic ID"} ), 404 )
    else:
        return make_response( jsonify( { "error" : "Missing Form Data"} ), 404 )
    
@app.route("/api/v1.0/comics/<string:id>", methods=["DELETE"])
def delete_comic(id):

    # Validate comic id
    if len(id) != 24 or not all(c in string.hexdigits for c in id):
        return make_response( jsonify( { "error" : "Invalid comic ID"} ), 404 )

    # Delete comic with matching id
    result = comics.delete_one( { "_id" : ObjectId(id) } )
    if result.deleted_count == 1:
        return make_response( jsonify( {} ), 204 )
    else:
        return make_response( jsonify( { "error" : "Invalid comic ID"} ), 404 )
    


@app.route("/api/v1.0/comics/<string:id>/reviews", methods=["POST"])
def add_new_review(id):

    # Validate comic id
    if len(id) != 24 or not all(c in string.hexdigits for c in id):
        return make_response( jsonify( { "error" : "Invalid comic ID"} ), 404 )

    # Validate the request form data and put it in the new review
    if "username" in request.form and "comment" in request.form and "stars" in request.form:
        new_review = {
            "_id" : ObjectId(),
                    "username": request.form["username"],
                    "comment": request.form["comment"],
                    "stars": request.form["stars"]
        }
        # Update comic by adding the new review
        comics.update_one(
            { "_id" : ObjectId(id) },
            { 
                "$push" : { "reviews" : new_review },
            }
        )
        new_review_link = "http://localhost:5000/api/v1.0/comics/" + id + \
                "/reviews/" + str(new_review["_id"])
        return make_response( jsonify( { "url" : new_review_link} ), 201)
    else:
        return make_response( jsonify( { "error" : "Missing Form Data"} ), 404 )

@app.route("/api/v1.0/comics/<string:id>/reviews", methods=["GET"])
def fetch_all_reviews(id):

    # Validate comic id
    if len(id) != 24 or not all(c in string.hexdigits for c in id):
        return make_response( jsonify( { "error" : "Invalid comic ID"} ), 404 )

    data_to_return = []
    comic = comics.find_one(
        { "_id" : ObjectId(id) }, { "reviews" : 1, "_id" : 0 }
    )
    for review in comic["reviews"]:
        review["_id"] = str(review["_id"])
        data_to_return.append(review)
    return make_response( jsonify( data_to_return ), 200 )
    
@app.route("/api/v1.0/comics/<string:id>/reviews/<string:review_id>", methods=["GET"])
def fetch_one_review(id, review_id):

    # Validate comic and review ids
    if len(id) != 24 or not all(c in string.hexdigits for c in id):
        return make_response( jsonify( { "error" : "Invalid comic ID"} ), 404 )
    if len(review_id) != 24 or not all(c in string.hexdigits for c in review_id):
        return make_response( jsonify( { "error" : "Invalid review ID"} ), 404 )

    # Find matching review in the comics collection
    comic = comics.find_one(
        { "reviews._id" : ObjectId(review_id) },
        { "_id" : 0, "reviews.$" : 1}
    )
    if comic is None:
        return make_response( jsonify( { "error" : "Invalid comic or Review ID"} ), 404)
    else:
        comic["reviews"][0]["_id"] = str(comic["reviews"][0]["_id"])
        return make_response( jsonify( comic["reviews"][0] ), 200 )
    
@app.route("/api/v1.0/comics/<string:id>/reviews/<string:review_id>", methods=["PUT"])
def edit_review(id, review_id):

    # Validate comic and review ids
    if len(id) != 24 or not all(c in string.hexdigits for c in id):
        return make_response( jsonify( { "error" : "Invalid comic ID"} ), 404 )
    if len(review_id) != 24 or not all(c in string.hexdigits for c in review_id):
        return make_response( jsonify( { "error" : "Invalid review ID"} ), 404 )

    # Validate the request form data and update the matching review in the comic reviews
    if "username" in request.form and "comment" in request.form and "stars" in request.form:
        edited_review = {
            "reviews.$.username" : request.form["username"],
            "reviews.$.comment" : request.form["comment"],
            "reviews.$.stars" : request.form["stars"]
        }
        # Update the comic with the edited review
        comics.update_one(
            { "reviews._id" : ObjectId(review_id) },
            { "$set" : edited_review }
        )
        edit_review_url = "http://localhost:5000/api/v1.0/comics/" + id + \
                "/reviews/" + review_id
        return make_response( jsonify( { "url" : edit_review_url } ), 200)
    else:
        return make_response( jsonify( { "error" : "Missing Form Data"} ), 404 )

@app.route("/api/v1.0/comics/<string:id>/reviews/<string:review_id>", methods=["DELETE"])
def delete_review(id, review_id):

    # Validate comic and review ids
    if len(id) != 24 or not all(c in string.hexdigits for c in id):
        return make_response( jsonify( { "error" : "Invalid comic ID"} ), 404 )
    if len(review_id) != 24 or not all(c in string.hexdigits for c in review_id):
        return make_response( jsonify( { "error" : "Invalid review ID"} ), 404 )

    # Update the comic by removing the review
    comics.update_one(
        { "_id" : ObjectId(id) },
        { "$pull" : { "reviews" : { "_id" : ObjectId(review_id) } } }
    ) 
    return make_response( jsonify( {} ), 204 )



@app.route("/api/v1.0/collections/<string:username>", methods=["GET"])
def show_collections(username):

    # Set up pagination for list of comics in personal collection
    page_num, page_size = 1,10
    if request.args.get("pn"):
        page_num = int(request.args.get('pn'))
    if request.args.get("ps"):
        page_size = int(request.args.get('ps'))
    page_start = (page_size * (page_num - 1))

    # Find all comics in the personal collection matching the username
    data_to_return = []
    for comic in collections.find( { "username" :{'$regex': username, '$options': 'i' }} ).skip(page_start).limit(page_size):
        comic["_id"] = str(comic["_id"])
        data_to_return.append(comic)

    return make_response( jsonify( data_to_return ), 200 )

@app.route("/api/v1.0/collections/<string:username>/<string:issue_id>", methods=["GET"])
def search_collection(username, issue_id):

    # Validate comic id
    if len(issue_id) != 24 or not all(c in string.hexdigits for c in issue_id):
        return make_response( jsonify( { "error" : "Invalid comic ID"} ), 404 )

    # Find a specific comic in a personal collection using the comic id from comics collection and username
    # Return the id of the comic from the comic in collections
    id_to_return = ''
    for comic in collections.find( { "username" :{'$regex': username, '$options': 'i' }} ):
        for comic in collections.find( { "issue_id" :{'$regex': issue_id, '$options': 'i' }} ):
            id_to_return = str(comic["_id"])

    return make_response( jsonify( id_to_return ), 200 )

@app.route("/api/v1.0/collections", methods=["POST"])
def add_to_collections():

    # Validate the request form data and add the new comic to the personal collection
    if "issue_id" in request.form and "username" in request.form and "issue_title" in request.form and "publish_date" in request.form and "image_url" in request.form:
        new_comic = {
        "username": request.form["username"],
        "issue_id": request.form["issue_id"],
        "issue_title" : request.form["issue_title"],
        "publish_date" : request.form["publish_date"],
        "image_url": request.form["image_url"],
        }
        new_comic_id = collections.insert_one(new_comic)
        new_comic_link = "http://localhost:5000/api/v1.0/collections/" + request.form["username"]
        return make_response( jsonify( { "url" : new_comic_link} ), 201 )
    else:
        return make_response( jsonify( { "error" : "Missing Form Data"} ), 404 )

@app.route("/api/v1.0/collections/<string:id>", methods=["DELETE"])
def delete_collection(id):

    # Validate collection id
    if len(id) != 24 or not all(c in string.hexdigits for c in id):
        return make_response( jsonify( { "error" : "Invalid comic ID"} ), 404 )
    
    # Delete comic from personal collection
    result = collections.delete_one( { "_id" : ObjectId(id), } )
    if result.deleted_count == 1:
        return make_response( jsonify( {} ), 204 )
    else:
        return make_response( jsonify( { "error" : "Invalid comic ID"} ), 404 )



@app.route("/api/v1.0/login", methods=["GET"])
def login():
    auth = request.authorization
    if auth:
        users = user.find_one( { "username" : auth.username } )
        if user is not None:
            if bcrypt.checkpw( bytes( auth.password, 'UTF-8' ), users["password"] ):
                token = jwt.encode( {
                    'user' : auth.username,
                    'admin' : user["admin"],
                    'exp' : datetime.datetime.utcnow() + datetime.timedelta(minutes=30)
                }, app.config['SECRET_KEY'])
                return make_response( jsonify( { 'token' : token }), 200 )
            else:
                return make_response( jsonify( {'message' : 'Bad password' } ), 401 )
        else:
            return make_response( jsonify( {'message' : 'Bad username' } ), 401 )
        
    return make_response( jsonify( { 'message' : 'Authentication required' } ), 401 )
        
@app.route("/api/v1.0/logout", methods=["GET"])
@jwt_required
def logout():
    token = request.headers['x-access-token']
    blacklist.insert_one( { "token" : token } )
    return make_response( jsonify( { 'message' : 'Logout successful' } ), 200 )


if __name__ == "__main__":
    app.run(debug = True)