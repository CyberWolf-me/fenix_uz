from aiogram.fsm.state import State, StatesGroup

class ReservationState(StatesGroup):
    waiting_for_date = State()
    waiting_for_time = State()
    waiting_for_guests = State()
    waiting_for_zone = State()
    waiting_for_name = State()
    waiting_for_phone = State()
    waiting_for_comment = State()
    confirmation = State()

class OrderState(StatesGroup):
    confirm_saved_details = State()  # 1-Click fast checkout for returning guests
    waiting_for_type = State()       # Delivery / Takeaway
    waiting_for_name = State()
    waiting_for_phone = State()
    waiting_for_address = State()
    waiting_for_payment = State()
    waiting_for_comment = State()
    confirmation = State()

class ProfileState(StatesGroup):
    waiting_for_name = State()
    waiting_for_phone = State()
    waiting_for_address = State()

class SearchState(StatesGroup):
    waiting_for_query = State()
