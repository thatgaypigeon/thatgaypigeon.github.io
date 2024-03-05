false = False
true = True


class array:
    def __init__(self, *args) -> None:
        self.array = list(args)

    def all(self, func) -> bool:
        """
        Returns :class:`true` if all elements of the array return true when passed as arguments into :param:`func`.

        Arguments:
            func: A function to be called

        Returns:
            :class:`bool`

        Raises:
            :class:`error`
        """
        for element in self.array:
            if not func(element):
                return false
        return true


arr = array(1, 2, 3, 4)


def func(item):
    return item > 2


print(arr.all(func))
