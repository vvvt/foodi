import React from "react";
import { FlatList, SafeAreaView, Modal, View, Text } from "react-native";
import MealItem from "../components/MealItem";
import styles from "./TemplateScreen.css";

import CanteenManager from "../manager/CanteenManager";
import MealManager from "../manager/MealManager";
import MealDetails from "../components/MealDetails";
import { FontAwesome5 as Icon } from "@expo/vector-icons";
import Spacer from "../components/Spacer";
import Locale from "../classes/Locale";
import { Directions, FlingGestureHandler, State } from "react-native-gesture-handler";
import moment from "moment";

const canteenManager = CanteenManager.instance;
const mealManager = MealManager.instance;

/**
 * Formats the current meal day string to a nice humanly readbable string
 * @param {string} currentDay The current day
 */
function formatMealDayString( currentDay ) {
  const d = moment(currentDay);
  const today = moment().startOf("day");
  const diff = d.diff(today, "days");
  if (diff === 0) return Locale.LOCALE.FINDER_SCREEN.today;
  if (diff === 1) return Locale.LOCALE.FINDER_SCREEN.tomorrow;
  if (diff === -1) return Locale.LOCALE.FINDER_SCREEN.yesterday;
  if (diff > 0) return d.format("dddd");
  return d.format("DD.MM.");
}

const ListEmptyComponent = () => (
  /* Is displayed if no meals could be loaded or the canteen is closed */
  <View style={styles.emptyListMessageContainer}>
    <Text style={styles.emptyListMessage}>{Locale.LOCALE.FINDER_SCREEN["list_no-meals"]}</Text>
  </View>
)
const ItemSeparatorComponent = () => <Spacer size={16} />
const ListHeaderComponent = () => <Spacer size={15} />
const ListFooterComponent = () => <Spacer size={15} />

export default class FinderScreen extends React.PureComponent {

  state = {
    mealsWithDistances: mealManager.surroundingMealFiltered,
    /** @type {import("../manager/MealManager").MealWithDistance} */
    currentItemDetails: null,
    view: canteenManager.currentLocationContext === "INSIDE" ? "inside" : "outside",
    currentDay: mealManager.currentMealDay
  };

  constructor(props) {
    super(props);

    this.onMealsChanged = this.onMealsChanged.bind(this);
    this.onLocationContextChanged = this.onLocationContextChanged.bind(this);
    this.onDayChanged = this.onDayChanged.bind(this);
    this.close = this.close.bind(this);
    this.renderItem = this.renderItem.bind(this);

    this.props.navigation.addListener("willFocus", this.onMealsChanged);
    this.props.navigation.addListener("willFocus", () => this.onLocationContextChanged(canteenManager.currentLocationContext, this.state.view === "inside" ? "INSIDE" : "VERY_FAR"));
  }

  OUTSIDE_ICON = (
    <Icon
      name="walking"
      color="#151522"
      onPress={() => this.toggleView()}
      size={22}
    />
  );
  
  INSIDE_ICON = (
    <Icon
      name="home"
      color="#151522"
      onPress={() => this.toggleView()}
      size={22}
    />
  );

  componentDidMount() {
    mealManager.on("mealsChanged", this.onMealsChanged);
    canteenManager.on("locationContextChanged", this.onLocationContextChanged);
    mealManager.on("currentDayChanged", this.onDayChanged);
  }

  componentWillUnmount() {
    mealManager.off("mealsChanged", this.onMealsChanged);
    canteenManager.off("locationContextChanged", this.onLocationContextChanged);
    mealManager.off("currentDayChanged", this.onDayChanged);
  }

  onMealsChanged() {
    console.log("meals changed");
    this.setState({ mealsWithDistances: mealManager.surroundingMealFiltered });
  }

  onDayChanged() {
    this.setState({ currentDay: mealManager.currentMealDay, mealsWithDistances: mealManager.surroundingMealFiltered });
  }

  /**
   * Updates the view if the user went from outside a canteen in a canteen or the other way around
   * @param {import("../manager/CanteenManager").LocationContext} currentContext The current user location context
   * @param {import("../manager/CanteenManager").LocationContext} previousContext The previous user location context
   */
  onLocationContextChanged(currentContext, previousContext) {
    const currentlyInside = currentContext === "INSIDE";
    const previouslyInside = previousContext === "INSIDE";
    if (currentlyInside !== previouslyInside) this.setState({ view: currentlyInside ? "inside" : "outside" });
  }

  toggleView() {
    this.state.view == "outside"
      ? this.setState({ view: "inside" })
      : this.setState({ view: "outside" });
  }

  /**
   * Gets called when the user does a fling gesture (a fast swipe) on the list
   * in a horizontal direction
   * @param {import("react-native-gesture-handler").Directions} direction The direction the fling was executed
   */
  onFling( direction ) {
    const selectedDay = moment(mealManager.currentMealDay).add( direction===Directions.LEFT?1:-1, "day" );
    if (selectedDay.diff(moment(), "days") > 6) return; // maximum one week difference
    const selectedDayString = selectedDay.format("YYYY-MM-DD");
    console.log("Changed the day to display from " + mealManager.currentMealDay + " to " + selectedDayString);
    mealManager.currentMealDay = selectedDayString;
  }

  render() {
    const { currentItemDetails, currentDay } = this.state;

    return (
      <>
        {/* The modal containing the meal details, including additives and an image */}
        <Modal
          animationType="slide"
          presentationStyle="pageSheet"
          transparent={false}
          visible={currentItemDetails !== null}
          onRequestClose={this.close}
        >
          <MealDetails
            {...currentItemDetails}
            OnClosePressed={this.close}
            OnNavigatePressed={() => {
              this.setState({ currentItemDetails: null });
              this.props.navigation.navigate("map", {
                targetCoordinate: currentItemDetails.canteen.coordinate
              });
            }}
          />
        </Modal>

        {/* HEADER: Switch between inside and outside mode */}
        <View style={styles.finderScreenHeaderContainer}>
          <View style={styles.finderScreenHeaderRow}>
            <Text style={styles.canteenTitle}>
              {this.state.view == "inside" ? canteenManager.nearestCanteen?.canteen.name : "Dresden"}
            </Text>
            {this.state.view === "inside" ? this.INSIDE_ICON : this.OUTSIDE_ICON}
          </View>
          <View style={styles.finderScreenHeaderRow}>
            <Text style={styles.currentDayText} >{formatMealDayString( currentDay )}</Text>
          </View>
        </View>

        {/* MEAL LIST */}
        <FlingGestureHandler 
          direction={Directions.LEFT}
          onHandlerStateChange={e => e.nativeEvent.state === State.END && this.onFling(Directions.LEFT)}
        >
          <FlingGestureHandler 
            direction={Directions.RIGHT}
            onHandlerStateChange={e => e.nativeEvent.state === State.END && this.onFling(Directions.RIGHT)}
          >
            <SafeAreaView style={styles.container}>
              <FlatList
                data={
                  this.state.view == "outside"
                    ? this.state.mealsWithDistances
                    : this.state.mealsWithDistances.filter( m => m.canteen.id === canteenManager.nearestCanteen?.canteen.id )
                }
                keyExtractor={item => item.meal.id + ""}
                renderItem={this.renderItem}
                ListEmptyComponent={ListEmptyComponent}
                ItemSeparatorComponent={ItemSeparatorComponent}
                ListHeaderComponent={ListHeaderComponent}
                ListFooterComponent={ListFooterComponent}
              />
            </SafeAreaView>
          </FlingGestureHandler>
        </FlingGestureHandler>
      </>
    );
  }

  /**
   * Render function to render a meal in the list
   * @param {{ item: import("../manager/MealManager").MealWithDistance }} obj An item as returned from the flatlist
   */
  renderItem({ item }) {
    return (
      <MealItem
        meal={item.meal}
        canteen={item.canteen}
        distance={item.distance}
        view={this.state.view}
        OnItemPressed={() => this.onMealPressed(item)}
      />
    );
  }

  /**
   * Closes the modal
   */
  close() {
    this.setState({ currentItemDetails: null });
  }

  /**
   * Callback that gets called when a meal item was pressed
   * @param {import("../manager/MealManager").MealWithDistance} mealItem The pressed item
   */
  async onMealPressed(mealItem) {
    // show modal
    this.setState({ currentItemDetails: mealItem });

    // if there is no image yet => try to load it (if even exists)
    if (mealItem.meal.hasDefaultImage) {
      const newMeal = await mealManager.refetchMeal(mealItem.meal);
      if (newMeal != null) {
        mealItem.meal = newMeal;
        this.setState({ currentItemDetails: Object.assign({}, mealItem) });
      }
    }
  }
}