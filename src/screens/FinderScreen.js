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

const canteenManager = CanteenManager.instance;
const mealManager = MealManager.instance;

export default class FinderScreen extends React.PureComponent {

  state = {
    mealsWithDistances: mealManager.surroundingMealFiltered,
    /** @type {import("../manager/MealManager").MealWithDistance} */
    currentItemDetails: null,
    view: canteenManager.currentLocationContext === "INSIDE" ? "inside" : "outside"
  };

  constructor(props) {
    super(props);

    this.onMealsChanged = this.onMealsChanged.bind(this);
    this.onLocationContextChanged = this.onLocationContextChanged.bind(this);
    this.close = this.close.bind(this);

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
  }

  componentWillUnmount() {
    mealManager.off("mealsChanged", this.onMealsChanged);
    canteenManager.off("locationContextChanged", this.onLocationContextChanged);
  }

  onMealsChanged() {
    this.setState({ mealsWithDistances: mealManager.surroundingMealFiltered });
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

  render() {
    const { currentItemDetails } = this.state;

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
          <Text style={styles.canteenTitle}>
            {this.state.view == "inside" ? canteenManager.nearestCanteen?.canteen.name : "Dresden"}
          </Text>
          {this.state.view === "inside" ? this.INSIDE_ICON : this.OUTSIDE_ICON}
        </View>

        {/* MEAL LIST */}
        <SafeAreaView style={styles.container}>
          <FlatList
            data={
              this.state.view == "outside"
                ? this.state.mealsWithDistances
                : this.state.mealsWithDistances.filter( m => m.canteen.id === canteenManager.nearestCanteen?.canteen.id )
            }
            keyExtractor={item => item.meal.id + ""}
            renderItem={({ item }) => (
              <MealItem
                meal={item.meal}
                canteen={item.canteen}
                distance={item.distance}
                view={this.state.view}
                OnItemPressed={() => this.onMealPressed(item)}
              />
            )}
            ListEmptyComponent={() => (
              /* Is displayed if no meals could be loaded or the canteen is closed */
              <View style={styles.emptyListMessageContainer}>
                <Text style={styles.emptyListMessage}>{Locale.LOCALE.FINDER_SCREEN["list_no-meals"]}</Text>
              </View>
            )}
            ItemSeparatorComponent={() => <Spacer size={16} />}
            ListHeaderComponent={() => <Spacer size={15} />}
            ListFooterComponent={() => <Spacer size={15} />}
          />
        </SafeAreaView>
      </>
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