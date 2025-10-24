def create_donor(donor):
    print("Registering donor:", donor.dict())
    # save to database from here
    return {"message": "Donor registered successfully", "data": donor}


def create_shelter(shelter):
    print("Registering shelter:", shelter.dict())
    # save to database from here
    return {"message": "Shelter registered successfully", "data": shelter}