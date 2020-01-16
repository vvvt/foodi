import React from "react";
import { FlatList, SafeAreaView, Modal } from "react-native";
import MealItem from "../components/MealItem";
import styles from "./TemplateScreen.css";

import MealManager from "../manager/MealManager";
import MealDetails from "../components/MealDetails";

const mealManager = MealManager.instance;

export default class FinderScreen extends React.PureComponent {

  state = {
    mealsWithDistances: mealManager.surroundingMealFiltered,
    /** @type {import("../manager/MealManager").MealWithDistance} */
    currentItemDetails: null
  };

  constructor(props) {
    super(props);
    
    this.onMealsChanged = this.onMealsChanged.bind(this);
    this.props.navigation.addListener( "willFocus", this.onMealsChanged );
  }

  componentDidMount() {
    mealManager.on("mealsChanged", this.onMealsChanged);
  }

  componentWillUnmount() {
    mealManager.off("mealsChanged", this.onMealsChanged);
  }

  onMealsChanged() {
    this.setState({ mealsWithDistances: mealManager.surroundingMealFiltered });
  }

  render() {

    const { currentItemDetails } = this.state;

    return (
      <>
        <Modal
          animationType="slide"
          presentationStyle="pageSheet"
          transparent={false}
          visible={currentItemDetails !== null}
        >
          <MealDetails
            {...currentItemDetails}
            OnClosePressed={() => this.setState({ currentItemDetails: null })}
            OnNavigatePressed={() => {
              this.setState({ currentItemDetails: null });
              this.props.navigation.navigate("map", { targetCoordinate: currentItemDetails.canteen.coordinate })
            }}
          />
        </Modal>
        <SafeAreaView style={styles.container}>
          <FlatList
            data={this.state.mealsWithDistances}
            keyExtractor={(item) => item.meal.id+""}
            renderItem={({ item }) => (
              <MealItem
                meal={item.meal}
                canteen={item.canteen}
                distance={item.distance}
                OnItemPressed={() => this.onMealPressed( item )}
              />
            )}
          />
        </SafeAreaView>
      </>
    );
  }

  /**
   * Callback that gets called when a meal item was pressed
   * @param {import("../manager/MealManager").MealWithDistance} mealItem The pressed item
   */
  async onMealPressed( mealItem ) {
    // show modal
    this.setState({ currentItemDetails: mealItem });

    // if there is no image yet => try to load it (if even exists)
    if (mealItem.meal.hasDefaultImage) {
      const newMeal = await mealManager.refetchMeal( mealItem.meal );
      if (newMeal != null) {
        mealItem.meal = newMeal;
        this.setState({ currentItemDetails: Object.assign({}, mealItem) });
      }
    }
  }

};